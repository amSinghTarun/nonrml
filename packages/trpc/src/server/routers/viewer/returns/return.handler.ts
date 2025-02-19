import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelReturnOrderSchema, TEditReturnSchema, TGetReturnOrdersSchema, TFinaliseReturnOrderSchema, TInitiateReturnSchema } from "./return.schema";
import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { getPublicURLOfImage, uploadToBucketFolder } from "@nonrml/storage";
import { dataURLtoFile } from "@nonrml/common";
import crypto from 'crypto';

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
    
    // Validate input
    
    try {

        if (!input || input.products.length === 0)
            throw { code: "BAD_REQUEST", message: "Invalid return input" }

        // Fetch return item IDs and prepare return products mapping
        const returnItemIds = input.products.map(product => product.orderProductId);
        const orderProductsToReturn: {[orderId: number]: typeof input.products[number]} = {};

        for( let product of input.products){
            orderProductsToReturn[product.orderProductId] = product;
        }

        // Fetch and validate order products
        const orderProducts = await prisma.orderProducts.findMany({
            where: {
                id: { 
                    in: returnItemIds 
                },
                order: {
                    userId: ctx.user!.id,
                    id: input.orderId
                }
            },
            include: { order: true }
        });

        // Validate order products
        if (!orderProducts || orderProducts.length !== returnItemIds.length) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Cannot return order" });
        }

        // Check return time limit
        if (Date.now() > Number(orderProducts[0]!.order.returnAcceptanceDate!)) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Cannot return order after allotted time" });
        }

        // Process return images and prepare return items data
        const returnItemsData: {
            referenceImage : string,
            returnReason : string,
            orderProductId : number,
            quantity : number,
        }[] = []

        //upload images and store links in returnItemsData
        for (let orderProduct of orderProducts) {
            const productToReturn = orderProductsToReturn[orderProduct.id];
            
            // Validate product quantity
            if (!productToReturn || orderProduct.quantity < productToReturn.quantity) {
                throw new TRPCError({ 
                    code: "FORBIDDEN", 
                    message: "Please select appropriate quantity/product to return" 
                });
            }

            // Upload image
            const imageUploaded = await uploadToBucketFolder(
                `return/${ctx.user?.id}:${orderProduct.id}:${productToReturn.quantity}:${Date.now()}`,
                dataURLtoFile(productToReturn.referenceImage, `${input.orderId}:${Date.now()}`)
            );

            if (imageUploaded.error) {
                throw new TRPCError({ 
                    code: "UNPROCESSABLE_CONTENT", 
                    message: "Unable to upload image" 
                });
            }

            // Get public URL
            const { data: imageUrl } = await getPublicURLOfImage(imageUploaded.data.path, false);

            returnItemsData.push({
                referenceImage: imageUrl.publicUrl,
                returnReason: productToReturn.returnReason,
                orderProductId: productToReturn.orderProductId,
                quantity: productToReturn.quantity,
            });
        }

        // If no return items, return empty response
        if (returnItemsData.length === 0) {
            return { status: TRPCResponseStatus.SUCCESS, message: "", data: {} };
        }

        // Execute main transaction
        const returnOrder = await prisma.$transaction(async (tx) => {
            // Create return order
            const returnOrderCreated = await tx.returns.create({
                data: {
                    orderId: input.orderId,
                    returnType: input.returnType,
                    returnItems:  {createMany: {data: returnItemsData }}
                },
                select: {
                    id: true,
                    returnItems: {
                        select: {
                            orderProductId: true,
                            id: true
                        }
                    }
                }
            });

            // Handle replacement order if applicable
            if (input.returnType === "REPLACEMENT") {

                let replacementItemsData = []
                for( let returnItem of returnOrderCreated.returnItems){
                    replacementItemsData.push({
                        returnItemId: returnItem.id,
                        productVariantId: orderProductsToReturn[returnItem.orderProductId]!.exchangeVariant!
                    })
                }

                tx.replacementOrder.create({
                    data: {
                        returnOrderId: returnOrderCreated.id,
                        orderId: input.orderId,
                        replacementItems: {createMany: {data: replacementItemsData}}
                    }
                });
            }

            return { returnOrderCreated };
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
        }

        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message: "", 
            data: returnOrder 
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
export const finaliseReturnOrderStatus = async ({ctx, input}: TRPCRequestOptions<TFinaliseReturnOrderSchema>) => {
    try{        
        let returnOrderUpdated = {};
        if(input.status == "RETURN_ACCEPTED"){
            const products = await prisma.orderProducts.findMany({
                where: {
                    id: {
                        in: input.productIds
                    }
                }
            });
            if(products.length == 0)
                throw new TRPCError({code: "NOT_FOUND", message: "No data for selected products"});
            
            const orderDetails = await prisma.orders.findUnique({
                where: {
                    id: input.orderId
                },
                include: {
                    discount: true
                }
            });
            if(!orderDetails)
                throw new TRPCError({code:"NOT_FOUND", message: "No data for the order id" + input.orderId});
            
            
            let refundAmount = '0';
            if(orderDetails?.productCount == products.length) {
                refundAmount = orderDetails.finalPrice
            } else {
                let grossRefundAmount = 0;
                for(let product of products){
                    grossRefundAmount += <number><unknown>product.price
                }
                if(orderDetails?.discount?.type == prismaEnums.DiscountType.PERCENTAGE){
                    grossRefundAmount -= ( ( grossRefundAmount * orderDetails.discount.discount ) / 100 );
                } else {
                    grossRefundAmount -= (orderDetails.discount?.discount! / orderDetails.productCount) * products.length;
                }
                refundAmount = <string><unknown>grossRefundAmount;
            }
            
            const queries = [];
            for(let product of products) {
                if(product.productStatus != prismaEnums.ProductStatus.RETURN_INITIATED)
                    throw new TRPCError({code:"BAD_REQUEST", message:"product must be in return state"});

                let inventoryQuery = prisma.inventory.update({
                    where: {
                        SKU: product.productSKU
                    },
                    data: {
                        quantity: product.quantity,
                        
                    }
                });
                let orderProductQuery = prisma.orderProducts.update({
                    where: {
                        id: product.id
                    },
                    data: {
                        productStatus: prismaEnums.ProductStatus.RETURN_ACCEPTED
                    }
                });
                queries.push(inventoryQuery);
                queries.push(orderProductQuery);
            };

            // initiate the refund with the payment service            

            // send e-mail saying that refund has been initiated
            
            queries.push(
                prisma.returns.update({
                    where: {
                        id: input.returnOrderId
                    },
                    data: {
                        returnReceiveDate: new Date(),
                        status: prismaEnums.ReturnStatus.RETURN_ACCEPTED
                    }
                })
            );

            await prisma.$transaction(queries);

        } else {

            // send the mail saying that the product didn't meet the quanlity check standards

            const queries = [];
            for(let product of input.productIds) {
                let orderProductQuery = prisma.orderProducts.update({
                    where: {
                        id: product
                    },
                    data: {
                        productStatus: prismaEnums.ProductStatus.RETURN_REJECTED
                    }
                });
                queries.push(orderProductQuery);
            };

            queries.push(
                prisma.returns.update({
                    where: {
                        id: input.returnOrderId
                    },
                    data: {
                        returnReceiveDate: new Date(),
                        status: prismaEnums.ReturnStatus.RETURN_REJECTED
                    }
                })
            );

            await prisma.$transaction(queries);
        }

        return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrderUpdated};

    }catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

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

        let orderProductsUpdateQuantity = [];

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
        if( input.returnStatus == "REVIEW_DONE" ){
            let returnItemsQueries = [];
            let returnItemsReview = input.reviewData;

            const returnProductVariantDetails = await prisma.returns.findUnique({
                where: {
                    id: input.returnId
                },
                select: {
                    order: {
                        select: {
                            userId: true,
                            id: true
                        }
                    },
                    returnType: true,
                    returnItems: {
                        select: {
                            id:true,
                            quantity: true,
                            orderProduct: {
                                select: {
                                    price: true
                                }
                            }
                        }
                    }
                }
            });

            if(!returnProductVariantDetails || !returnProductVariantDetails.returnItems)
                throw { code: "BAD_REQUEST", message: "RETURN ID INVALID"}
            
            let refundAmount = 0;

            for( let returnProduct of returnProductVariantDetails.returnItems ){
                let rejectedQuamtity = returnItemsReview && returnItemsReview[returnProduct.id]?.rejectedQuantity;
                if(returnItemsReview && rejectedQuamtity){
                    // for every product mark the rejected and reason
                    if(!returnItemsReview[returnProduct.id]?.rejectReason)
                        throw { code: "BAD_REQUEST", message: "MUST SPECIFY REJECT REASON"}

                    returnItemsQueries.push(
                        prisma.returnItem.update({
                            where: {
                                id: +returnProduct.id
                            },
                            data: {
                                rejectReason: returnItemsReview[returnProduct.id]?.rejectReason,
                                rejectedQuantity: rejectedQuamtity
                            }
                        })
                    )
                }
                refundAmount += ( returnProduct.quantity - ( rejectedQuamtity || 0 )) * ( +returnProduct.orderProduct.price )
            }
            
            returnItemsQueries.push(
                prisma.returns.update({
                    where: {
                        id: input.returnId
                    },
                    data: {
                        refundAmount: refundAmount
                    }
                }),
            );

            refundAmount != 0 && returnItemsQueries.push(
                prisma.creditNotes.create({
                    data: {
                        returnOrderId: input.returnId,
                        value: refundAmount,
                        redeemed: false,
                        creditNoteOrigin: returnProductVariantDetails.returnType,
                        userId: returnProductVariantDetails.order.userId,
                        expiryDate: new Date( new Date().setMonth( new Date().getMonth() + 6 ) ),
                        creditCode: `RTN-${returnProductVariantDetails.order.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${returnProductVariantDetails.order.id}`
                    }
                })
            )

            prisma.$transaction(returnItemsQueries);
        }

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