import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelReturnOrderSchema, TDeleteReturnSchema, TGetReturnOrdersSchema, TFinaliseReturnOrderSchema, TInitiateReturnSchema } from "./return.schema";
import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { uploadToBucketFolder } from "@nonrml/storage";
const returnExchangeTime = 604800000; // 2-3 day
import { dataURLtoFile } from "@nonrml/common";

/*
    Return the order
    Process:
        Check the products and the return time constraint
        Charge the user, return penalty fee
        initiate the return shipment
        create the return record
        update the status of order products as return initiated
    
*/
export const initiateReturn = async ({ctx, input}: TRPCRequestOptions<TInitiateReturnSchema>)   => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        // validate the orderProducts.
        // save the image with expiry.
        // create return order.
        // create the return Item with pending status.
        // if admin accept then create the shipment

        const orderProductsToReturn : {[orderId: number]: typeof input.products[number]} = {};
        const returnItemIds : number[] = [];
        for(let product of input.products ){
            orderProductsToReturn[product.orderProductId] = product
            returnItemIds.push(product.orderProductId)
        }
        const orderPrducts = await prisma.orderProducts.findMany({
            where: {
                id: {
                    in: returnItemIds,
                },
                order: {
                    userId: ctx.user!.id,
                    id: input.orderId
                },
            },
            include: {
                order: true
            }
        });
        if(!orderPrducts || orderPrducts.length != returnItemIds.length)
            throw new TRPCError({code: "NOT_FOUND", message:"Can'nt return order"});

        if(Date.now() > Number(orderPrducts[0]!.order.deliveryDate!) + returnExchangeTime)
            throw new TRPCError({code: "FORBIDDEN", message:"Can'nt return order after alloted time"});

        // loop to handle all the products in return
        let returnItemsData : {
                returnId?: number,
                referenceImage: string,
                returnReason: string,
                orderProductId: number,
                quantity: number
        }[]  = [];

        for(let orderProduct of orderPrducts){
            //console.log(orderProductsToReturn[orderProduct.id], orderProduct.quantity, orderProductsToReturn[orderProduct.id]!.quantity)
            if(!orderProductsToReturn[orderProduct.id] || orderProduct.quantity < orderProductsToReturn[orderProduct.id]!.quantity)
                throw new TRPCError({code:"FORBIDDEN", message:"Please select appropriate quantity/product to return"});

            const imageUplaoded = await uploadToBucketFolder(`return/${ctx.user?.id}:${orderProduct.id}:${orderProductsToReturn[orderProduct.id]!.quantity}:${Date.now()}`, dataURLtoFile(input.products[0]?.referenceImage!, "1"));
            //console.log(imageUplaoded);

            imageUplaoded.data && returnItemsData.push({
                referenceImage: imageUplaoded.data.fullPath,
                returnReason: orderProductsToReturn[orderProduct.id]!.returnReason,
                orderProductId: orderProductsToReturn[orderProduct.id]!.orderProductId,
                quantity: orderProductsToReturn[orderProduct.id]!.quantity
            });
        }

        if(returnItemsData.length > 0){
            const returnOrder = await prisma.$transaction(async (prisma) => {
                const returnOrderCreated = await prisma.returns.create({
                    data:{
                        orderId: input.orderId,
                        returnType: input.returnType
                    }
                });
                let replacementOrder = null
                if(returnOrderCreated.returnType == "REPLACEMENT"){
                    replacementOrder = await prisma.replacementOrder.create({
                        data: {
                            returnOrderId: returnOrderCreated.id,
                            orderId: input.orderId
                        }
                    });
                }

                const returnItems = await prisma.returnItem.createManyAndReturn({
                    data: returnItemsData.map( (returnItem) => ({...returnItem, returnId: returnOrderCreated.id}))
                });
                if(returnOrderCreated.returnType == "REPLACEMENT" && replacementOrder != null){
                    for(let returnItem of returnItems){
                        await prisma.replacementItem.create({
                            data: {
                                replacementOrderId: replacementOrder.id,
                                returnItemId: returnItem.id,
                                productVariantId: orderProductsToReturn[returnItem.orderProductId]!.exchangeVariant!
                            }
                        })
                    }
                }
                
                return { returnItems, returnOrderCreated };
            });            
            //console.log(returnOrder)    
            return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrder};
        }
        
        return {status:TRPCResponseStatus.SUCCESS, message: "", data: {}};

    }  catch(error) {
        //console.log("\n\n Error in Initiate Return ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
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
                        acceptedQuantity: true,
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
    try{
        const userId = ctx?.user?.id;
        const replacementOrderDetails = await prisma.returns.findUnique({
            where: {
                id: input.returnOrderId
            }
        });

        throw new TRPCError({code: "UNAUTHORIZED", message: "Can't cancel the order once it's Confirmed"});
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }   
}