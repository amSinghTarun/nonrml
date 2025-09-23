import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelReturnOrderSchema, TEditReturnSchema, TGetReturnOrdersSchema, TFinaliseReturnOrderSchema, TInitiateReturnSchema } from "./return.schema";
import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { getPublicURLOfImage, uploadToBucketFolder } from "@nonrml/storage";
import { dataURLtoFile } from "@nonrml/common";
import crypto from 'crypto';
import { cacheServicesRedisClient } from "@nonrml/cache";
import { sendSMTPMail } from "@nonrml/mailing";
import { generateReplacementConfirmationEmail } from "@nonrml/common";
import { ShiprocketShipping } from "@nonrml/shipping";

/*
    Return the order
    Process:
        Check the products and the return time constraint
        Charge the user, return penalty fee
        initiate the return shipment
        create the return record
        update the status of order products as return initiated
    
*/
export const initiateReturn = async ({ctx, input}: TRPCRequestOptions<TInitiateReturnSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try {
        
        console.log(input);

        // Process return images and prepare return items data
        if(input.returnType == "RETURN" && !input.referenceImages && !input.returnReason)
            throw { code: "BAD_REQUEST", message: "Image and explanation is required"}

        // Fetch return item IDs and prepare return products mapping
        const returnItemIds = input.products.map(product => product.orderProductId);
        const orderProductsToReturn: {[orderId: number]: typeof input.products[number]} = {};

        for( let product of input.products)
            orderProductsToReturn[product.orderProductId] = product;

        // Fetch and validate order products
        const orderProducts = await prisma.orderProducts.findMany({
            where: {
                id: { 
                    in: returnItemIds 
                },
                order: {
                    ...( ctx.user?.role != "ADMIN" && {userId: ctx.user!.id}),
                    id: input.orderId
                }
            },
            include: { 
                productVariant: {
                    select: {
                        subSku: true,
                        product: {
                            select: {
                                productImages: {
                                    where: { active: true, priorityIndex: 0 },
                                    select: {
                                        image: true
                                    }
                                },
                                sku: true,
                            }
                        }
                    }
                },
                order: {
                    include: {
                        address: true,
                        shipment: true
                    }
                },
            }
        });

        // Validate order products
        if (!orderProducts || orderProducts.length !== returnItemIds.length)
            throw new TRPCError({ code: "NOT_FOUND", message: "Cannot return order" });

        // Check return time limit
        if (Date.now() > Number(orderProducts[0]!.order.returnAcceptanceDate!))
            throw new TRPCError({ code: "FORBIDDEN", message: "Cannot replace order after allotted time" });

        let imageUrls: string[] = [];
        let damageExplanation : null|string = null
        if(input.returnType == "RETURN"){
            imageUrls = <any>[];
            damageExplanation = input.returnReason ? input.returnReason : null;
            let i = 0
            for(let image of input.referenceImages!){
                const imageUploaded = await uploadToBucketFolder(
                    `return/${ctx.user?.id}${input.orderId}:${Date.now()}`,
                    dataURLtoFile(image, `${input.orderId}:${i++}:${Date.now()}`)
                );
    
                if (imageUploaded.error) {
                    console.log(imageUploaded.error)
                    throw new TRPCError({ 
                        code: "UNPROCESSABLE_CONTENT", 
                        message: "Unable to upload image" 
                    });
                }
    
                // Get public URL
                const { data } = await getPublicURLOfImage(imageUploaded.data.path, false);
                imageUrls.push(data.publicUrl);
            }
        }

        const returnItemsData: {
            orderProductId : number,
            quantity : number,
        }[] = []

        // check return quantity
        for (let orderProduct of orderProducts) {
            const productToReturn = orderProductsToReturn[orderProduct.id];
            
            // Validate product quantity
            if (!productToReturn || orderProduct.quantity < productToReturn.quantity) {
                throw new TRPCError({ 
                    code: "FORBIDDEN", 
                    message: "Please select appropriate quantity/product to change" 
                });
            }

            returnItemsData.push({
                orderProductId: productToReturn.orderProductId,
                quantity: productToReturn.quantity,
            });
        }

        // If no return items, return empty response
        if (returnItemsData.length === 0) 
            return { status: TRPCResponseStatus.SUCCESS, message: "", data: {} };

        // Execute main transaction
        const returnOrder = await prisma.$transaction(async ( tx ) => {
            // Create return order
            const returnOrderCreated = await tx.returns.create({
                data: {
                    orderId: input.orderId,
                    returnType: input.returnType,
                    ...( input.returnType == "REPLACEMENT" && {returnStatus: "ALLOWED"}),
                    ...(input.returnType == "RETURN" && {
                        imagese: imageUrls,
                        explanation: damageExplanation
                    }),
                    returnItems:  {createMany: {data: returnItemsData }}
                },
                select: {
                    id: true,
                    order: {
                        select: {
                            email: true
                        }
                    },
                    returnItems: {
                        select: {
                            orderProductId: true,
                            id: true
                        }
                    }
                }
            });
            
            let replacementOrder : {id: number} | null = null;
            // Handle replacement order if applicable
            if (input.returnType == prismaEnums.ReturnType.REPLACEMENT) {

                let replacementItemsData = <any>[]
                for( let returnItem of returnOrderCreated.returnItems){
                    replacementItemsData.push({
                        returnItemId: returnItem.id,
                        productVariantId: orderProductsToReturn[returnItem.orderProductId]!.exchangeVariant!
                    })
                }

                replacementOrder = await tx.replacementOrder.create({
                    data: {
                        returnOrderId: returnOrderCreated.id,
                        orderId: input.orderId,
                        replacementItems: {createMany: {data: replacementItemsData}}
                    },
                    select: {
                        id: true
                    }
                });
            }

            return { returnOrderCreated, replacementOrder };
        }, { timeout: 10000 });

        // Update order product replacement/return quantities
        if (returnOrder.returnOrderCreated) {
            const quantityUpdates = orderProducts.map(orderProduct => 
                prisma.orderProducts.update({
                    where: { id: orderProduct.id },
                    data: input.returnType === "REPLACEMENT"
                        ? { replacementQuantity: {increment: orderProductsToReturn[orderProduct.id]?.quantity} }
                        : { returnQuantity: {increment: orderProductsToReturn[orderProduct.id]?.quantity} }
                })
            )
            await prisma.$transaction(quantityUpdates)

            // mail to confirm the replacement order and explain the process
            if(returnOrder.returnOrderCreated.order.email && returnOrder.replacementOrder?.id){
                sendSMTPMail({
                    userEmail: returnOrder.returnOrderCreated.order.email,
                    emailBody: generateReplacementConfirmationEmail(`${returnOrder.replacementOrder.id}`)
                });
            }
        }

        // create the return shipment
        // store the shipment details in the shipment table.
        const dimension : {length: number, breadth: number, height: number, weight: number} = JSON.parse(orderProducts[0]!.order.shipment!.dimensions)
        const company_warehouse_address = await prisma.address.findFirst({where: {type: "COMPANY_WAREHOURSE"}})
        let subTotal = 0;
        await ShiprocketShipping.ShiprocketShipping.createReturnOrder({
            order_id: `RTN-${returnOrder.returnOrderCreated.id}`,
            order_date: new Date().toISOString(),
            payment_method: "Prepaid",
            ...dimension,
             // pickup (required fields)
            pickup_customer_name: orderProducts[0]!.order.address!.contactName,
            pickup_address: orderProducts[0]!.order.address!.location,
            pickup_city: orderProducts[0]!.order.address!.city,
            pickup_state: orderProducts[0]!.order.address!.state,
            pickup_country: "INDIA",
            pickup_pincode: Number(orderProducts[0]!.order.address!.pincode),
            pickup_email: orderProducts[0]!.order.email,
            pickup_phone: orderProducts[0]!.order.address!.contactNumber.replace(/\D/g, "").slice(-10),

            // shipping (required fields) - Address of company warehouse
            shipping_customer_name: company_warehouse_address!.contactName,
            shipping_address: company_warehouse_address!.location,
            shipping_city: company_warehouse_address!.city,
            shipping_state: company_warehouse_address!.state,
            shipping_country: "INDIA",
            shipping_pincode: Number(company_warehouse_address!.pincode),
            shipping_phone: company_warehouse_address!.contactNumber.replace(/\D/g, "").slice(-10),

            // order items
            order_items: orderProducts.map(item => {
                const { quantity } = returnItemsData.find( returnItem => returnItem.orderProductId == item.id)!
                subTotal += item.price * quantity
                return {
                    name: item.productVariant.product.sku,
                    sku: item.productVariant.subSku,
                    units: quantity,
                    selling_price: item.price,
                    qc_product_image: item.productVariant.product.productImages[0]?.image,
                    qc_product_name: item.productVariant.product.sku,
                    qc_enable: true,
                } 
            }),
            sub_total: subTotal,

        })

        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message: "", 
            data: { orderId: input.orderId} 
        };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            error = { 
                code: "BAD_REQUEST", 
                message: error.code === "P2025" 
                    ? "Requested record does not exist" 
                    : error.message, 
                cause: error.meta?.cause 
            };
        }
        throw TRPCCustomError(error);
    }
};

/*
    edit the return order
    Not really sure about it's use, maybe in payment process it can be used
*/
export const getReturnOrders = async ({ctx, input}: TRPCRequestOptions<TGetReturnOrdersSchema>)   => {
    const prisma = ctx.prisma;
    const userId = ctx.user?.id;
    input = input!;
    try{
        const returnOrders = await prisma.returns.findMany({
            where: {
                orderId: input.orderId,
                order: {
                    userId: userId
                },
                returnType: "RETURN"
            },
            include: {
                creditNote: {
                    select: {
                        creditCode: true,
                        value: true
                    }
                },
                returnItems: {
                    select: {
                        quantity: true,
                        rejectedQuantity: true,
                        status: true,
                        orderProduct: {
                            select: {
                                price: true,
                                productVariant: {
                                    select: {
                                        size: true,
                                        product: {
                                            select: {
                                                name: true,
                                                productImages: {
                                                    where: {
                                                        priorityIndex: 0
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
    
        return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrders};
    }  catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Finalise the return, i.e Accept it or Reject it
    Process
        get the products
        calculate the refund
        initiate the refund
        send mail saying refund has been sent
        update the quantity
        update the status as return accepted and date as well
*/
// export const finaliseReturnOrderStatus = async ({ctx, input}: TRPCRequestOptions<TFinaliseReturnOrderSchema>) => {
//     try{        
//         let returnOrderUpdated = {};
//         if(input.status == "RETURN_ACCEPTED"){
//             const products = await prisma.orderProducts.findMany({
//                 where: {
//                     id: {
//                         in: input.productIds
//                     }
//                 }
//             });
//             if(products.length == 0)
//                 throw new TRPCError({code: "NOT_FOUND", message: "No data for selected products"});
            
//             const orderDetails = await prisma.orders.findUnique({
//                 where: {
//                     id: input.orderId
//                 },
//                 include: {
//                     discount: true
//                 }
//             });
//             if(!orderDetails)
//                 throw new TRPCError({code:"NOT_FOUND", message: "No data for the order id" + input.orderId});
            
            
//             let refundAmount = '0';
//             if(orderDetails?.productCount == products.length) {
//                 refundAmount = orderDetails.finalPrice
//             } else {
//                 let grossRefundAmount = 0;
//                 for(let product of products){
//                     grossRefundAmount += <number><unknown>product.price
//                 }
//                 if(orderDetails?.discount?.type == prismaEnums.DiscountType.PERCENTAGE){
//                     grossRefundAmount -= ( ( grossRefundAmount * orderDetails.discount.discount ) / 100 );
//                 } else {
//                     grossRefundAmount -= (orderDetails.discount?.discount! / orderDetails.productCount) * products.length;
//                 }
//                 refundAmount = <string><unknown>grossRefundAmount;
//             }
            
//             const queries = [];
//             for(let product of products) {
//                 if(product.productStatus != prismaEnums.ProductStatus.RETURN_INITIATED)
//                     throw new TRPCError({code:"BAD_REQUEST", message:"product must be in return state"});

//                 let inventoryQuery = prisma.inventory.update({
//                     where: {
//                         SKU: product.productSKU
//                     },
//                     data: {
//                         quantity: product.quantity,
                        
//                     }
//                 });
//                 let orderProductQuery = prisma.orderProducts.update({
//                     where: {
//                         id: product.id
//                     },
//                     data: {
//                         productStatus: prismaEnums.ProductStatus.RETURN_ACCEPTED
//                     }
//                 });
//                 queries.push(inventoryQuery);
//                 queries.push(orderProductQuery);
//             };

//             // initiate the refund with the payment service            

//             // send e-mail saying that refund has been initiated
            
//             queries.push(
//                 prisma.returns.update({
//                     where: {
//                         id: input.returnOrderId
//                     },
//                     data: {
//                         returnReceiveDate: new Date(),
//                         status: prismaEnums.ReturnStatus.RETURN_ACCEPTED
//                     }
//                 })
//             );

//             await prisma.$transaction(queries);

//         } else {

//             // send the mail saying that the product didn't meet the quanlity check standards

//             const queries = [];
//             for(let product of input.productIds) {
//                 let orderProductQuery = prisma.orderProducts.update({
//                     where: {
//                         id: product
//                     },
//                     data: {
//                         productStatus: prismaEnums.ProductStatus.RETURN_REJECTED
//                     }
//                 });
//                 queries.push(orderProductQuery);
//             };

//             queries.push(
//                 prisma.returns.update({
//                     where: {
//                         id: input.returnOrderId
//                     },
//                     data: {
//                         returnReceiveDate: new Date(),
//                         status: prismaEnums.ReturnStatus.RETURN_REJECTED
//                     }
//                 })
//             );

//             await prisma.$transaction(queries);
//         }

//         return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrderUpdated};

//     }catch(error) {
//         //console.log("\n\n Error in getAddress ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     }
// };

/*
    as per the documentation, if the order is in ready to ship/pick status, thn it can be cancelled
    check the status of the shipment
    check for status of shipment
    if in transit cancel the order
    else return the can't cancel thing 
    cancel / reject as per the status
*/
export const cancelReturn = async ({ctx, input} : TRPCRequestOptions<TCancelReturnOrderSchema>) => {
    const prisma = ctx.prisma;
    const userId = ctx?.user?.id;
    input = input!;
    try{

        const returnProducts = await prisma.returnItem.findMany({
            where: {
                returnId: input.returnOrderId,
            },
            select: {
                return: {
                    select: {
                        returnType: true
                    }
                },
                orderProductId: true,
                quantity: true
            }
        });

        let orderProductsUpdateQuantity = <any>[];

        orderProductsUpdateQuantity.push(
            prisma.returns.update({
                where: {
                    id: input.returnOrderId,
                    ...(ctx.user?.role != "ADMIN" && {order: { userId: userId }}),
                    returnStatus: prismaEnums.ReturnStatus.PENDING
                },
                data: {
                    ...(ctx.user?.role == "ADMIN" ? {returnStatus: prismaEnums.ReturnStatus.CANCELLED_ADMIN} : {returnStatus: prismaEnums.ReturnStatus.CANCELLED}),
                }
            })
        )
        
        for( let product of returnProducts ) {
            orderProductsUpdateQuantity.push(
                prisma.orderProducts.update({
                    where: {
                        id: product.orderProductId
                    },
                    data: {
                        ...( product.return.returnType == "REPLACEMENT" ? { replacementQuantity: {decrement : product.quantity} } : { returnQuantity: {decrement: product.quantity}}
                        )
                    }
                })
            )
        }

        prisma.$transaction(orderProductsUpdateQuantity);

        return {status:TRPCResponseStatus.SUCCESS, message: "", data: {}};

    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }   
}

export const editReturn = async ({ctx, input} : TRPCRequestOptions<TEditReturnSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        console.log(input)
        // this is not to be used as it uses the old credit note logic and it's the older version
        // if( input.returnStatus == "ASSESSED" ){
        //     let returnItemsReview = input.reviewData; 

        //     const returnProductVariantDetails = await prisma.returns.findUnique({
        //         where: {
        //             id: input.returnId
        //         },
        //         select: {
        //             order: {
        //                 select: {
        //                     userId: true,
        //                     id: true,
        //                     email: true
        //                 }
        //             },
        //             refundAmount: true,
        //             creditNote: {
        //                 select: {
        //                     id: true
        //                 }
        //             },
        //             returnType: true,
        //             returnItems: {
        //                 select: {
        //                     id:true,
        //                     quantity: true,
        //                     orderProduct: {
        //                         select: {
        //                             price: true,
        //                             productVariantId: true,
        //                             productVariant: {
        //                                 select: {
        //                                     productId: true
        //                                 }
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     });

        //     if(!returnProductVariantDetails || !returnProductVariantDetails.returnItems || !returnProductVariantDetails.order.userId)
        //         throw { code: "BAD_REQUEST", message: "RETURN ID INVALID"}
            
        //     let refundAmount = 0;
        //     let returnItemsQueries = <any>[];
        //     let restockQueries = <any>[];
        //     let redisQueries = <any>[]

        //     for( let returnProduct of returnProductVariantDetails.returnItems ){
        //         redisQueries.push(cacheServicesRedisClient().del(`productVariantQuantity_${returnProduct.orderProduct.productVariant.productId}`))
        //         let rejectedQuamtity = returnItemsReview && returnItemsReview[returnProduct.id]?.rejectedQuantity;
        //         if(returnItemsReview && rejectedQuamtity){
        //             // for every product mark the rejected and reason
        //             if(!returnItemsReview[returnProduct.id]?.rejectReason)
        //                 throw { code: "BAD_REQUEST", message: "MUST SPECIFY REJECT REASON"}

        //             returnItemsQueries.push(
        //                 prisma.returnItem.update({
        //                     where: {
        //                         id: +returnProduct.id
        //                     },
        //                     data: {
        //                         rejectReason: returnItemsReview[returnProduct.id]?.rejectReason,
        //                         rejectedQuantity: rejectedQuamtity
        //                     }
        //                 })
        //             )
        //         }
        //         refundAmount += ( returnProduct.quantity - ( rejectedQuamtity || 0 )) * ( +returnProduct.orderProduct.price )
                
        //         // Increment the accepted returned product in the inventory
        //         restockQueries.push(
        //             prisma.inventory.update({
        //                 where: {
        //                     productVariantId: returnProduct.orderProduct.productVariantId
        //                 },
        //                 data: {
        //                     quantity: {
        //                         increment: returnProduct.quantity - ( rejectedQuamtity || 0 )
        //                     }
        //                 }
        //             })
        //         )

        //     }
            
        //     let refundQueries = <any>[];
        //     // update the refund amount
        //     // The check in this and in 1 below it are precautionary so that if the process is running again, they don't perform the steps again
        //     !returnProductVariantDetails.refundAmount && refundQueries.push(
        //         prisma.returns.update({
        //             where: {
        //                 id: input.returnId
        //             },
        //             data: {
        //                 refundAmount: refundAmount
        //             }
        //         }),
        //     );

        //     // create the credit note
        //     // TO-DO : Add functionality to send it over mail 
        //     refundAmount != 0 && !returnProductVariantDetails.creditNote.length && refundQueries.push(
        //         prisma.creditNotes.create({
        //             data: {
        //                 returnOrderId: input.returnId,
        //                 value: refundAmount,
        //                 email: returnProductVariantDetails.order.email, 
        //                 remainingValue: refundAmount,
        //                 creditNoteOrigin: returnProductVariantDetails.returnType,
        //                 userId: returnProductVariantDetails.order.userId,
        //                 expiryDate: new Date( new Date().setMonth( new Date().getMonth() + Number(process.env.CREDIT_NOTE_EXPIRY) ) ),
        //                 creditCode: `RTN-${returnProductVariantDetails.order.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${returnProductVariantDetails.order.id}`
        //             }
        //             // address edit
        //         })
        //     )

        //     await prisma.$transaction(refundQueries);
        //     await prisma.$transaction(returnItemsQueries);            
        //     await prisma.$transaction(restockQueries); 
        //     await Promise.all(redisQueries);
        // }


        // delete the cache whatever
        
        const replacementOrderDetails = await prisma.returns.update({
            where: {
                id: input.returnId,
            },
            data: {
                returnStatus: input.returnStatus,
                ...( input.returnStatus == "RECEIVED" && { returnReceiveDate: new Date() })
            }
        });

        if(!replacementOrderDetails)
            throw {code: "UNAUTHORIZED", message: "Can't cancel the order once it's Confirmed"};

        return {status:TRPCResponseStatus.SUCCESS, message: "", data: replacementOrderDetails};

    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }   
}

export const getAllReturnOrders = async ({ctx, input}: TRPCRequestOptions<{}>)   => {
    const prisma = ctx.prisma;
    try{
        const returnOrders = await prisma.returns.findMany({
            select: {
                id:true,
                orderId: true,
                returnReceiveDate: true,
                returnStatus: true,
                ReplacementOrder: {
                    select: {
                        id: true,
                        status: true
                    }
                } 
            },
            orderBy: [
                {createdAt: "desc"}
            ]
        });
    
        return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrders};
    }  catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};