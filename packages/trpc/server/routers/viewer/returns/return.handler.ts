import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { checkAdmin, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelReturnOrderSchema, TDeleteReturnSchema, TEditReturnSchema, TFinaliseReturnOrderSchema, TInitiateReturnSchema } from "./return.schema";
import { Prisma, prisma, prismaEnums } from "@nonorml/prisma";
import { TRPCError } from "@trpc/server";
let returnCharge = 250; // should come from env
const returnExchangeTime = 86440; // 2-3 day

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
    try{
        const orderPrducts = await prisma.orderProducts.findMany({
            where: {
                id: {
                    in: input.productIds
                },
                order: {
                    deliveryDate:   {
                        gte: Date.now() - returnExchangeTime 
                    }
                },
                product: {
                    returnAvl: true
                }
            },
            include: {
                order: true
            }
        });
        if(!orderPrducts)
            throw new TRPCError({code: "NOT_FOUND", message:"Can'nt return order with products" + input.productIds});

        // create a payment of return charge
        let returnChargePaymentId = 0;
        // initiate the return shipment
        let returnShipmentId = 1;
    
        const returnOrder = await prisma.returns.create({
            data: {...input, status: prismaEnums.ReturnStatus.PENDING, returnChargeId: returnChargePaymentId}
        });
        
        await prisma.orderProducts.updateMany({
            where:{
                id: {
                    in: input.productIds
                }
            },
            data: {
                productStatus: prismaEnums.ProductStatus.RETURN_INITIATED
            }
        })
    
        return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnOrder};
    }  catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    edit the return order
    Not really sure about it's use, maybe in payment process it can be used
*/
export const editReturn = async ({ctx, input}: TRPCRequestOptions<TEditReturnSchema>)   => {
    try{
        // check with shipment company about the status of parcell if status is delivered then only let the
        // status chane
        const returnRecord = await prisma.returns.update({
            where: {
                id: input.returnId
            },
            data: { ...input }
        });
    
        return {status:TRPCResponseStatus.SUCCESS, message: "", data: returnRecord};
    }  catch(error) {
        console.log("\n\n Error in getAddress ----------------");
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
        console.log("\n\n Error in getAddress ----------------");
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
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }   
}