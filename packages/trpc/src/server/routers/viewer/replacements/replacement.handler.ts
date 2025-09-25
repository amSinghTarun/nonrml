import { TRPCResponseStatus, TRPCAPIResponse, dataURLtoFile, generateReplacementShippingNotificationEmail, generateShippingNotificationEmail } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TInitReplacementOrderSchema, TGetReplacementOrderSchema, TUpdateNonReplaceQuantitySchema, TEditReplacementOrderSchema, TShipReplacementSchema } from "./replacement.schema";
import { Prisma, prismaEnums } from "@nonrml/prisma";
import { cacheServicesRedisClient } from "@nonrml/cache";
import { sendSMTPMail } from "@nonrml/mailing";
import { ShiprocketShipping } from "@nonrml/shipping";


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
                shipment: true,
                order: {
                    select: {
                        id: true, 
                        idVarChar: true,
                    }
                },
                return: {
                    select:{
                        returnStatus: true,
                        returnReceiveDate: true,
                        shipment: true
                    }
                },
                CreditNotes: {
                    select: {
                        creditCode: true,
                        value: true
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
        });

        const bankRefunds = await prisma.refundTransactions.count({
            where: {
                trigger: "replacement",
                Payments: {
                    orderId: input.orderId,
                },
                bankRefundValue: {
                    gte: 1
                }
            }
        });

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: {replacementOrder, bankRefunds}};
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

// Edit order
export const editReplacementOrder = async ({ctx, input} : TRPCRequestOptions<TEditReplacementOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let updateData = {
            ...(input.replacementStatus && {status: input.replacementStatus})
        }
        const replacementUpdated = await prisma.replacementOrder.update({
            where: {
                id: input.replacementId
            },
            data: updateData
        })

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: replacementUpdated};

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
                                        productId: true,
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
        
        let replaceAllowedItems = 0;
        for( let returnItem of dataForReplacement.returnItems){
            let updateQueries = <any>[];
            
            console.log("In the finalize method loop", returnItem);
            // A way to figure out the processed deeds
            if(returnItem.status == "PENDING"){
                // prepare query to update the return item rejected quantity and reason and status
                updateQueries.push(
                    prisma.returnItem.update({
                        where: {
                            id: returnItem.id
                        },
                        data: {
                            ...(input.reviewData[returnItem.id] && {rejectedQuantity: input.reviewData[returnItem.id]?.rejectedQuantity}),
                            ...(input.reviewData[returnItem.id] && {rejectReason: input.reviewData[returnItem.id]?.rejectReason}),
                            status: prismaEnums.ReturnItemStatus.CONFIRMED
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

                replaceAllowedItems =+ (returnItem.quantity - (input.reviewData[returnItem.id]?.rejectedQuantity ?? 0))
                
                // to update the replaceable quantity in replacement table
                let replacableQuantity = ( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) 
                > ( returnItem.ReplacementItem?.productVariant.inventory?.quantity! + returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! ) 
                ? ( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) - ( returnItem.ReplacementItem?.productVariant.inventory?.quantity! + returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! )
                : returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0 );
                
                // prepare query to lessen the replacement product variant inventory as per the new order.
                let productVariantLeft = Math.max(returnItem.ReplacementItem?.productVariant.inventory?.quantity! - replacableQuantity, 0);

                // it's only for calc, no actual use case, how many left after lesseing from product variant for base inventory
                let quantityRequiredAfterInventoryUsed = Math.max(replacableQuantity - returnItem.ReplacementItem?.productVariant.inventory?.quantity!, 0);
                let baseInventoryLeft = Math.max((returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! || 0) - (quantityRequiredAfterInventoryUsed || 0), 0);

                updateQueries.push(
                    // this is to decrement the quantity from the replaced size
                    prisma.inventory.update({
                        where: {
                            id: returnItem.ReplacementItem?.productVariant.inventory?.id
                        },
                        data: {
                            quantity: productVariantLeft,
                            ...(returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory && {baseSkuInventory: { update: { quantity: baseInventoryLeft }}})
                        }
                    })
                )

                // prepare query to update non-replacable quantity, return - rejected - avl > 0 ? return - rejected - avl : 0.
                console.log(Math.max(( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) - ( (returnItem.ReplacementItem?.productVariant.inventory?.quantity! || 0) + (returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! || 0) ), 0 ))
                updateQueries.push(
                    prisma.replacementItem.update({
                        where: {
                            id: returnItem.ReplacementItem?.id
                        },
                        data: {
                            nonReplacableQuantity: Math.max(( returnItem.quantity - ( input.reviewData[returnItem.id]?.rejectedQuantity || 0) ) - ( (returnItem.ReplacementItem?.productVariant.inventory?.quantity! || 0) + (returnItem.ReplacementItem?.productVariant.inventory?.baseSkuInventory?.quantity! || 0) ), 0 )
                        }
                    })
                )
                console.log("Going in treansactions", updateQueries)
                await prisma.$transaction(updateQueries, {timeout: 10000});
                await cacheServicesRedisClient().del(`productVariantQuantity_${returnItem.orderProduct.productVariant.productId}`)
                console.log("Out of treansactions")
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
                status: replaceAllowedItems == 0 ? "ASSESSED" : "PROCESSING",
                return: { update: { returnStatus: "ASSESSED" } }
            }
        })

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

export const shipReplacementOrder = async ({ctx, input}: TRPCRequestOptions<TShipReplacementSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        console.log("shipReplacementOrder")

        const response = await ShiprocketShipping.ShiprocketShipping.createOrder(input.shiprocketOrderData)
        console.log(response)

        if(response.orderId){
           const repalcementOrderDetails =  await prisma.replacementOrder.update({
                where: {
                    id: input.replacementOrderId
                },
                data: {
                    shipment: {
                        create: {
                            shipmentOrderId: `${response.orderId}`,
                            shipmentId: `${response.shipmentId}`,
                            shipmentServiceName: "Shiprocket",
                            dimensions: JSON.stringify({
                                "weight": input.shiprocketOrderData.weight,
                                "length": input.shiprocketOrderData.dimensions.length,
                                "height": input.shiprocketOrderData.dimensions.height,
                                "breadth": input.shiprocketOrderData.dimensions.breadth 
                            })
                        }
                    }
                },
                select: {
                    order: {
                        select: {
                            email: true,
                            id: true,
                            idVarChar: true
                        }
                    },
                    id: true
                }
            });    
    
            // send the product shipped mail with tracking details tracking mail and has info of processingRefundAmount 
            // no need to check for the mail, it will be present in the orderDetails
            await sendSMTPMail({
                userEmail: repalcementOrderDetails.order.email, 
                emailBody: generateReplacementShippingNotificationEmail({  
                    orderId: `ORD-${repalcementOrderDetails.order.id}${repalcementOrderDetails.order.idVarChar}`,
                    replacementId: `REPL-${repalcementOrderDetails.id}`,
                    trackingLink: `https://www.nonrml.co.in/exchanges/${repalcementOrderDetails.id}`
                })
            })
        } else {
            throw { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong"}
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"Shipped Successfully", data: ""};

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError)
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error); 
    }
}