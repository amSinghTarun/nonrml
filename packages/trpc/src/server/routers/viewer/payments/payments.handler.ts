import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import * as paymentSchemas from "./payments.schema";
import { createOrder } from "@nonrml/payment";                                          

export const createRZPOrder = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TCreateRzpOrderSchema>) => {
    try{
        const address = await prisma.address.findUniqueOrThrow({
            where: {
                id: input!.addressId
            }
        })
        //console.log(input);
        const rzpOrder = await createOrder({ 
            amount: input!.orderTotal*100,
            currency: "INR",
            customer_details: {
                name: address.contactName,
                email: address.email,
                contact: address.contactNumber,
                billing_address: {
                    line1: address.location,
                    city: address.city,
                    state: address.state,
                },
                shipping_address: {
                    line1: address.location,
                    city: address.city,
                    state: address.state,
                }
            },
            notes: {
                contact: ctx.user?.contactNumber!
            }
        });        
        const payment = await prisma.payments.create({
            data: {
                rzpOrderId: rzpOrder.id,
                paymentStatus: rzpOrder.status as prismaTypes.PaymentStatus,
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message: "Order created", data: payment };
    } catch(error) {
        //console.log("\n\n Error in createpayments ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

export const updateFailedPaymentStatus = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TChangePaymentStatusSchema>) => {
    const prisma = ctx.prisma;
    input = input!
    try{
        //console.log(input)
        const orderDetails = await prisma.orders.findFirstOrThrow({
            where: {
                payment:{
                    rzpOrderId: input.orderId,
                    paymentStatus: {
                        in: ["failed", "attempted", "created"]
                    }
                }
            },
            select: {
                id: true,
                payment: {
                    select: {
                        id: true
                    }
                }
            }
        });
        if(!orderDetails.payment) throw new Error("Payment details not found"); 
        await prisma.payments.update({
            where: {
                id: orderDetails.payment.id
            },
            data: {
                paymentStatus: input.paymentStatus
            }
        });
        //console.log("payment status updated", orderDetails.id)
        const orderUpdated = await prisma.orders.update({
            where: {
                id: orderDetails.id
            },
            data: {
                orderStatus: prismaEnums.OrderStatus.PAYMENT_FAILED
            }
        });
        //console.log("order status updated", orderUpdated)
        return { status: TRPCResponseStatus.SUCCESS, message: "Payment status updated", data: "" };
    } catch(error) {
        //console.log("\n\n Error in changePaymentStatus ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};


/*
Get the payment with custom status filter, by default the active status is set to true, it means
if not specified any status, it will give the active payments
*/
export const getpayments = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TGetpaymentSchema>)   => {
    try{
        const payments = await prisma.payments.findMany({
            where: {
                active: input.active
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Roles fetched", data: payments};
    } catch(error) {
        //console.log("\n\n Error in getpayments ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/* 
edit the active status and name of the payment of a payment,
*/
export const editpayments = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TEditpaymentSchema>)   => {
    try{
        const updateData : {active: boolean, paymentName: string} | {active: boolean} = input;
        const edittedpayment = await prisma.payments.update({
            where:{
                id: input.paymentId
            },
            data: updateData
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: edittedpayment};
    } catch(error) {
        //console.log("\n\n Error in editpayments ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/*
Delete a payment
*/
export const deletepayments = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TDeletepaymentSchema>)   => {
    try{
        await prisma.payments.delete({
            where: {
                id: input.paymentId
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"Role deleted", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deletepayments ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};