import { TRPCResponseStatus, TRPCAPIResponse, dataURLtoFile } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TGetReplacementOrderSchema, TInitiateReplacementOrderSchema } from "./replacement.schema";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { initiateOrder } from "../orders/orders.handler";
import { TInitiateOrderSchema } from "../orders/orders.schema";
import { uploadToBucketFolder } from "@nonrml/storage";
const allowedReplacements = 2; // should come from env
const returnExchangeTime = 86440; // 2-3 day

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
                        replacementQuantity: true,
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
                                acceptedQuantity: true,
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
    const prisma = ctx.prisma;
    input = input!;
    try{
        // Write the logic of after the return order for this replacement has been accepted

    }  catch(error) {
        //console.log("\n\n Error in Initiate Return ----------------");
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
        //console.log("\n\n Error in editReplacementOrder ----------------");
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
        //console.log("\n\n Error in cancelReplacementOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 

};