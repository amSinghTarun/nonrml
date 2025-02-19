import { TRPCResponseStatus } from "@nonrml/common";
import { calculateRejectedQuantityRefundAmounts, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import * as paymentSchemas from "./payments.schema";
import { createOrder, initiateNormalRefund } from "@nonrml/payment";         
import crypto from 'crypto';                                 

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
// Backend function
export const getPayments = async ({ ctx, input }: TRPCRequestOptions<paymentSchemas.TGetPaymentsSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    const pageSize = 20;
    const skip = (input.page ?? 0) * pageSize;
  
    try {
      let searchQuery = {
        ...(input.search && { [input.search.includes("ORD") ? "orderId" : "id"]: input.search }),
        ...(input.paymentStatus && { paymentStatus: input.paymentStatus }),
        ...(input.startDate && { createdAt: { gte: input.startDate } }),
        ...(input.endDate && { createdAt: { lte: input.endDate } }),
      };
  
      const [payments, total] = await Promise.all([
        prisma.payments.findMany({
          where: searchQuery,
          include: {
            RefundTransactions: true,
            Orders: {
              select: {
                totalAmount: true
              }
            }
          },
          orderBy: [
            { createdAt: "desc" }
          ],
          take: pageSize,
          skip: skip
        }),
        prisma.payments.count({
          where: searchQuery
        })
      ]);
  
      return {
        status: TRPCResponseStatus.SUCCESS,
        message: "Payments fetched",
        data: payments,
        pagination: {
          total,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          page: input.page ?? 0
        }
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        error = {
          code: "BAD_REQUEST",
          message: error.code === "P2025" ? "Requested record does not exist" : error.message,
          cause: error.meta?.cause
        };
      throw TRPCCustomError(error);
    }
};


/**
 * get all refunds detail against a payment id, bank refund, credit note issues 
 */
export const getPaymentRefundDetails = async ({ ctx, input }: TRPCRequestOptions<paymentSchemas.TGetPaymentRefundDetailsSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try {
  
        const refundDetails = await prisma.refundTransactions.findMany({
            where: { 
                rzpPaymentId: input.rzpPaymentId 
            },
            include: {
                CreditNotes: true
            }
        })
  
        return { status: TRPCResponseStatus.SUCCESS, message: "Payments fetched", data: refundDetails };

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        error = {
          code: "BAD_REQUEST",
          message: error.code === "P2025" ? "Requested record does not exist" : error.message,
          cause: error.meta?.cause
        };
      throw TRPCCustomError(error);
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

export const initiateUavailibiltyRefund = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TInitiateUavailibiltyRefundSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let refundTransactionId = null;
        let refundDetails = await calculateRejectedQuantityRefundAmounts(input.orderId, true)
        
        if(!refundDetails.refundToBank)
            throw { code: "BAD_REQUEST", message: "TO refund details to prcess"}

        let razorpayPaymentDetails = await prisma.payments.findFirst({
            where: {
                orderId: input.orderId,
                paymentStatus: "paid"
            }
        })

        if(!razorpayPaymentDetails || razorpayPaymentDetails.rzpPaymentId === null)
            throw { code: "BAD_REQUEST", message: "No valid payments"}

        // to check for last refund process
        let existingRefundTransactionDetails = await prisma.refundTransactions.findFirst({
            where: {
                rzpPaymentId: razorpayPaymentDetails?.rzpPaymentId
            },
            orderBy: [{
                "createdAt" : "desc"
            }]
        });

        if(!existingRefundTransactionDetails){
            // create refund record update the credit note and amounts, as a precautionary to failures
            const refundTransaction = await prisma.$transaction( async prisma => {
                const refundTransaction = await prisma.refundTransactions.create({
                    data: {
                        rzpPaymentId: razorpayPaymentDetails.rzpPaymentId!,
                        bankRefundValue: refundDetails.refundToBank,
                        ...(refundDetails.creditNoteId && {creditNoteId: refundDetails.creditNoteId}),
                    }
                });

                if(refundDetails.refundToCredit && refundDetails.creditNoteId) {
                    await prisma.creditNotes.update({
                        where: {
                            id: refundDetails.creditNoteId
                        },
                        data: {
                            value: {increment: refundDetails.refundToCredit},
                            redeemed: false
                        }
                    })
                }

                return refundTransaction;
            });
            refundTransactionId = refundTransaction.id;
        } else {
            refundTransactionId = existingRefundTransactionDetails.id;
        }

        if(!refundTransactionId)
            throw {code: "INTERNAL_SERVER_ERROR", message: "Refund Id missing"}
        
        if(!existingRefundTransactionDetails || !existingRefundTransactionDetails?.rzpRefundId || existingRefundTransactionDetails?.rzpRefundStatus == "failed") {            
            
            //initiate bank refund
            const rzpRefundDetails = await initiateNormalRefund(razorpayPaymentDetails.rzpPaymentId, { amount: refundDetails.refundToBank, speed: "normal"})
    
            if(!rzpRefundDetails.id)
                throw { code: "INTERNAL_SERVER_ERROR", message: "Refund not processed"}
    
            // update the refund in the create record
            await prisma.refundTransactions.update({
                where: {
                    id: refundTransactionId
                },
                data: {
                    rzpRefundId: rzpRefundDetails.id,
                    rzpRefundStatus: rzpRefundDetails.status
                }
            })
        }

        prisma.$transaction([
            ...refundDetails.updateOrderProductReimbursedQueries
        ]);

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    } catch(error) {
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}