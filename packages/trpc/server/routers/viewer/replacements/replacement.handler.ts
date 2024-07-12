import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelReplacementOrderSchema, TChangeReplacementOrderStatusSchema, TGetReplacementOrderSchema, TInitiateReplacementOrderSchema } from "./replacement.schema";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonorml/prisma";
import { TRPCError } from "@trpc/server";
import { initiateOrder } from "../orders/orders.handler";
import { TInitiateOrderSchema } from "../orders/orders.schema";
const allowedReplacements = 2; // should come from env
const returnExchangeTime = 86440; // 2-3 day

/*  I don't think it will be used, user will get the replacement orders details in the order section only   */

/*
    initiate the replacement order.
    Process
        Check the return requirements, like time since delivery, replcaement count
        Check the replacement reason and also check if proofs are required
        Check the company return address
        if proof are required and provided upload them to S3
        create the replacement order
        create the shipment order
        update the replacement order and update the shipment order in it

    If the shipment is accepted then we will create a order with payment detaials and all from same before
*/
export const initiateReplacementOrder = async ({ctx, input} : TRPCRequestOptions<TInitiateReplacementOrderSchema>) => {
    try{        
        const orderProduct = await prisma.orderProducts.findFirst({
            where: {
                id: input.orderProducId,
                quantity: {
                    gte: input.quantity
                },
                order: {
                    deliveryDate: {
                        lte: returnExchangeTime+Date.now()
                    }
                },
                replacementCount: {
                    gt: allowedReplacements
                }
            },
            include: {
                order: {
                    include: {
                        shipment: true
                    }
                }
            }
        });
    
        if(!orderProduct)
            throw new TRPCError({code: "NOT_FOUND", message: "Can't replace order"});
        
        const replacementReason = await prisma.replacementReason.findFirst({
            where: {
                id: input.replacementReasonId
            }
        });
        if(!replacementReason)
            throw new TRPCError({code: "NOT_FOUND", message: "No replacement reason with the given Id"});
        if( (replacementReason.photoProofRequired && !input.replacementRequiredPhoto) || (replacementReason.videoProofRequired && !input.replacementRequiredVide)){
            throw new TRPCError({code:"BAD_REQUEST", message:"Please provide with the proper proofs"});
        }
        
        const address = await prisma.address.findFirst({
            where: {
                type: prismaEnums.AddressType.COMPANY_WAREHOURSE
            }
        });
        if(!address) // maybe sent an email as well
            throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Warehouse address missing"})
        
        //might have to store the image and video in s3
        
        const replacementOrder = await prisma.replacementOrder.create({
            data: {
                ...input,
                replacementOrderStatus: prismaEnums.ReplacementOrderStatus.INITIATED,
                productOrderId: orderProduct.id,
            }
        });
        
        // initaite a shipment, where you have to schedule a return/replacement with the logistic api
        let returnShipmentId = 1;
        
        const updateReplacementOrder = await prisma.replacementOrder.update({
            where: {
                id: replacementOrder.id
            },
            data: {
                returnShipmentId
            }
        })
    
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: updateReplacementOrder};
    } catch(error) {
        console.log("\n\n Error in initiateReplacementOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 
}

/* 
    Edit the status of replacement order
    Process:
        if status is accepted then create a new order to send the new item to the user,
        call the order creating function,
            payment, shipment and all will be handled there only
*/
export const changeReplacementOrderStatus = async ({ctx, input} : TRPCRequestOptions<TChangeReplacementOrderStatusSchema>) => {
    try{
        switch(input.replacementOrderStatus){
            case prismaEnums.ReplacementOrderStatus.ACCEPTED:
                const originalOrderDetails = await prisma.replacementOrder.findUnique({
                    where: {
                        id: input.replacementOrderId
                    },
                    include: {
                        productOrder: {
                            include : {
                                order: true
                            }
                        }
                    }
                })
                const newOrderInput : TInitiateOrderSchema = {
                    type: prismaEnums.OrderType.REPLACEMENT,
                    directOrder: true,
                    productDetails: {
                        sku: originalOrderDetails?.productOrder.productSKU!,
                        quantity: originalOrderDetails?.quantity!
                    },
                    originalOrderId: originalOrderDetails?.productOrder.orderId!,
                    addressId: originalOrderDetails?.productOrder.order.addressId!,
                    paymentId: originalOrderDetails?.productOrder.order.paymentId!,
                }

                await initiateOrder({ctx: ctx, input: newOrderInput});
                break;
            case prismaEnums.ReplacementOrderStatus.REJECTED:
                //send mail saying the QC(quality check) has failed
                break;
        }
        const updatedReplacementOrder = await prisma.replacementOrder.update({
            where: {
                id: input.replacementOrderId
            },
            data: input
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: updatedReplacementOrder};
    } catch(error) {
        console.log("\n\n Error in editReplacementOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 
}

/*
    as per the documentation, if the order is in ready to ship/pick status, thn it can be cancelled
    Process:
        check the status of the shipment
        check for required status
        cancel / reject as per the status
*/
export const cancelReplacementOrder = async ({ctx, input}: TRPCRequestOptions<TCancelReplacementOrderSchema>) => {
    try{
        const userId = ctx?.user?.id;
        const replacementOrderDetails = await prisma.replacementOrder.findUnique({
            where: {
                id: input.replacementOrderId
            }
        });
        // check for status of shipment
        // if in transit cancel the order
        // else return the can't cancel thing 
        // put the below query in else condition
        throw new TRPCError({code: "UNAUTHORIZED", message: "Can't cancel the order once it's Confirmed"});
    } catch(error) {
        console.log("\n\n Error in cancelReplacementOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 

};