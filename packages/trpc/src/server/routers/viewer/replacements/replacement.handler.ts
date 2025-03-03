import { TRPCResponseStatus, TRPCAPIResponse, dataURLtoFile } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TInitReplacementOrderSchema, TGetReplacementOrderSchema, TUpdateNonReplaceQuantitySchema } from "./replacement.schema";
import { Prisma } from "@nonrml/prisma";


export const getReplacementOrders = async ({ctx, input}: TRPCRequestOptions<TGetReplacementOrderSchema>)   => {
    const prisma = ctx.prisma;
    input = input!;
    const userId = ctx.user!.id;
    try{
        const replacementOrder = await prisma.replacementOrder.findMany({
            where: {
                orderId: input.orderId,
                order: {
                    userId: userId
                }
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
                shipmentId: true,
                return: {
                    select:{
                        returnStatus: true
                    }
                },
                replacementItems: {
                    select: {
                        nonReplacableQuantity: true,
                        nonReplaceAction: true,
                        productVariant: {
                            select:{
                                size: true
                            }
                        },
                        returnOrderItem: {
                            select: {
                                status: true,
                                quantity: true,
                                rejectedQuantity: true,
                                orderProduct:{
                                    select: {
                                        price: true,
                                        productVariant:{
                                            select: {
                                                size: true,
                                                product: {
                                                    select: {
                                                        name: true,
                                                        productImages: {
                                                            where: {
                                                                priorityIndex: 0
                                                            },
                                                            select: {
                                                                image: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: replacementOrder};
    }  catch(error) {
        //console.log("\n\n Error in Initiate Return ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

// alter the quantity of the available replaceable quanatities
export const updateNonReplaceQuantity = async ({ctx, input} : TRPCRequestOptions<TUpdateNonReplaceQuantitySchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const replacementQuantityUpdated = await prisma.replacementItem.update({
            where: {
                id: input.replacementOrderProductId
            },
            data: {
                nonReplacableQuantity: input.nonReplacementQuantity
            }
        })

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: replacementQuantityUpdated};

    }  catch(error) {
        //console.log("\n\n Error in Initiate Return ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

// create a finc to finalize the return and start replacement    
    // Tasks
        // - Submit review and update status
        // - Reduce the quantity for replacement
        // - Mark the non-replaceable quantities
        // - Button to give credit note for the non-replaceable quantity 
export const finaliseReturnAndMarkReplacementOrder = async ({ctx, input}: TRPCRequestOptions<TInitReplacementOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        // Transactions - repalcement product length
        // get replacement order and product variants plus inventory and return Item to update review - 1, get status
        const dataForReplacement = await prisma.returns.findFirst({
            where: {
                ReplacementOrder : { id: input.replacementOrderId }
            },
            include: {
                returnItems: {
                    include: {
                        orderProduct: {
                            select: {
                                productVariant: {
                                    select: {
                                        inventory: {
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        ReplacementItem: {
                            select: {
                                id: true,
                                productVariant: {
                                    select: {
                                        inventory: {
                                            select: {
                                                id: true, 
                                                quantity: true,
                                                baseSkuInventory: {
                                                    select: {
                                                        quantity: true,
                                                        id: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if(!dataForReplacement || !dataForReplacement?.returnItems.length)
            throw {code: "BAD_REQUEST", message: "Invalid Replacement Order Id"}
        
        for( let returnItem of dataForReplacement.returnItems){
            let updateQueries = [];

            // A way to figure out the processed deeds
            if(returnItem.status != "PENDING"){

                // prepare query to update the return item rejected quantity and reason and status
                updateQueries.push(
                    prisma.returnItem.update({
                        where: {
                            id: returnItem.id
                        },
                        data: {
                            ...(input.reviewData[returnItem.id] && {rejectedQuantity: input.reviewData[returnItem.id]?.rejectedQuantity}),
                            ...(input.reviewData[returnItem.id] && {rejectReason: input.reviewData[returnItem.id]?.rejectReason}),
                            status: "CONFIRMED"
                        }
                    })
                )

                // prepare query to update the returned product variant inventory with returned accepted quantity ( not rejected )
                if( (returnItem.quantity - (input.reviewData[returnItem.id]?.rejectedQuantity || 0)) > 0 ){
                    updateQueries.push(
                        prisma.inventory.update({
                            where: {
                                id: returnItem.orderProduct.productVariant.inventory?.id!
                            },
                            data: {
                                quantity : {
                                    increment: returnItem.quantity - (input.reviewData[returnItem.id]?.rejectedQuantity || 0)
                                }
                            }
                        })
                    )
                }
                
                // to update the replaceable quantity in replacement table
                let replacableQuantity = ( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) 
                > ( returnItem.ReplacementItem?.productVariant.inventory?.quantity! + returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! ) 
                ? ( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) - ( returnItem.ReplacementItem?.productVariant.inventory?.quantity! + returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! )
                : returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0 );
                
                // prepare query to lessen the replacement product variant inventory as per the new order.
                let productVariantLeft = Math.max(returnItem.ReplacementItem?.productVariant.inventory?.quantity! - replacableQuantity, 0);

                // it's only for calc, no actual use case, how many left after lesseing from product variant for base inventory
                let quantityRequiredAfterInventoryUsed = Math.max(replacableQuantity - returnItem.ReplacementItem?.productVariant.inventory?.quantity!, 0);
                let baseInventoryLeft = Math.max(returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! - quantityRequiredAfterInventoryUsed, 0);


                updateQueries.push(
                    prisma.inventory.update({
                        where: {
                            id: returnItem.ReplacementItem?.productVariant.inventory?.id
                        },
                        data: {
                            quantity: productVariantLeft,
                            baseSkuInventory: { update: { quantity: baseInventoryLeft }}
                        }
                    })
                )

                // prepare query to update non-replacable quantity, return - rejected - avl > 0 ? return - rejected - avl : 0.
                updateQueries.push(
                    prisma.replacementItem.update({
                        where: {
                            id: returnItem.ReplacementItem?.id
                        },
                        data: {
                            nonReplacableQuantity: Math.max(( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) - ( returnItem.ReplacementItem?.productVariant.inventory?.quantity! + returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! ), 0 )
                        }
                    })
                )

                await prisma.$transaction(updateQueries);
            }
        }

        // Transaction - 2
        // prepare query to update the return status - don't need fetch
        // prepare query to update the replacement status = "Processing" - don't need fetch
        await prisma.replacementOrder.update({
            where: {
                id : input.replacementOrderId
            },
            data: {
                status: "PROCESSING",
                return: { update: { returnStatus: "REVIEW_DONE" } }
            }
        })

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

// /* 
//     Edit the status of replacement order
//     Process:
//         if status is accepted then create a new order to send the new item to the user,
//         call the order creating function,
//             payment, shipment and all will be handled there only
// */
// export const changeReplacementOrderStatus = async ({ctx, input} : TRPCRequestOptions<TChangeReplacementOrderStatusSchema>) => {
//     try{
//         switch(input.replacementOrderStatus){
//             case prismaEnums.ReplacementOrderStatus.ACCEPTED:
//                 const originalOrderDetails = await prisma.replacementOrder.findUnique({
//                     where: {
//                         id: input.replacementOrderId
//                     },
//                     include: {
//                         productOrder: {
//                             include : {
//                                 order: true
//                             }
//                         }
//                     }
//                 })
//                 const newOrderInput : TInitiateOrderSchema = {
//                     type: prismaEnums.OrderType.REPLACEMENT,
//                     directOrder: true,
//                     productDetails: {
//                         sku: originalOrderDetails?.productOrder.productSKU!,
//                         quantity: originalOrderDetails?.quantity!
//                     },
//                     originalOrderId: originalOrderDetails?.productOrder.orderId!,
//                     addressId: originalOrderDetails?.productOrder.order.addressId!,
//                     paymentId: originalOrderDetails?.productOrder.order.paymentId!,
//                 }

//                 await initiateOrder({ctx: ctx, input: newOrderInput});
//                 break;
//             case prismaEnums.ReplacementOrderStatus.REJECTED:
//                 //send mail saying the QC(quality check) has failed
//                 break;
//         }
//         const updatedReplacementOrder = await prisma.replacementOrder.update({
//             where: {
//                 id: input.replacementOrderId
//             },
//             data: input
//         });
//         return { status: TRPCResponseStatus.SUCCESS, message:"", data: updatedReplacementOrder};
//     } catch(error) {
//         //console.log("\n\n Error in editReplacementOrder ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     } 
// }

// /*
//     as per the documentation, if the order is in ready to ship/pick status, thn it can be cancelled
//     Process:
//         check the status of the shipment
//         check for required status
//         cancel / reject as per the status
// */
// export const cancelReplacementOrder = async ({ctx, input}: TRPCRequestOptions<TCancelReplacementOrderSchema>) => {
//     try{
//         const userId = ctx?.user?.id;
//         const replacementOrderDetails = await prisma.replacementOrder.findUnique({
//             where: {
//                 id: input.replacementOrderId
//             }
//         });
//         // check for status of shipment
//         // if in transit cancel the order
//         // else return the can't cancel thing 
//         // put the below query in else condition
//         throw new TRPCError({code: "UNAUTHORIZED", message: "Can't cancel the order once it's Confirmed"});
//     } catch(error) {
//         //console.log("\n\n Error in cancelReplacementOrder ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     } 

// };