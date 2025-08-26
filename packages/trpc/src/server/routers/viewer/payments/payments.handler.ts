import { generateRefundNotificationEmail, TRPCResponseStatus } from "@nonrml/common";
import { calculateRejectedQuantityRefundAmounts, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import * as paymentSchemas from "./payments.schema";
import { createOrder, initiateNormalRefund } from "@nonrml/payment";
import crypto from 'crypto';
import { sendSMTPMail } from "@nonrml/mailing";

export const rzpPaymentUpdateWebhook = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TRzpPaymentUpdateWebhookSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    console.log("Input Payment and refund", input)
    try{
        const paymentDetails = await prisma.payments.findUnique({
            where: {
                rzpOrderId: input.rzpOrderId
            }
        });

        if(!paymentDetails) 
            return { status: TRPCResponseStatus.SUCCESS, message: "Invalid data", data: "Payment record doesn't exist" };

        let paymentStatus = input.paymentStatus as prismaTypes.PaymentStatus; 

        if(Object.values(prismaEnums.PaymentStatus).includes(paymentStatus)){
            // webhooks can come in wrong sequence
            if(paymentDetails.paymentStatus != "captured"){
                await prisma.payments.update({
                    where: {
                        rzpOrderId: input.rzpOrderId
                    },
                    data: {
                        paymentStatus: paymentStatus
                    }
                });
            }
        }

        if(input.refundId && input.refundStatus){
            const refundTransaction = await prisma.refundTransactions.findUnique({
                where: {
                    rzpRefundId: input.refundId
                }
            });
            if(!refundTransaction) 
                return { status: TRPCResponseStatus.SUCCESS, message: "Invalid refund data", data: "Refund record doesn't exist" };
            if(refundTransaction?.rzpRefundStatus != "processed"){
                await prisma.refundTransactions.update({
                    where: {
                        id: refundTransaction.id
                    },
                    data: {
                        rzpRefundStatus: input.refundStatus
                    }
                })
            }

        }

        return { status: TRPCResponseStatus.SUCCESS, message: "Order created", data: {} };
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
        if(input.secret != process.env.RZP_PAYMENT_FAIL_CALL_SECRET){
            throw {code: "UNAUTHORIZED", message: "Unauthorized access"}
        }
        const paymentDetails = await prisma.payments.update({
            where: {
                rzpOrderId: input.orderId,
                paymentStatus: {
                    not: "captured"
                }
            },
            data: {
                paymentStatus: input.paymentStatus
            }
        });
        // if(!orderDetails.payment) throw new Error("Payment details not found"); 
        //console.log("payment status updated", orderDetails.id)
        const orderUpdated = await prisma.orders.update({
            where: {
                id: paymentDetails.orderId,
                orderStatus: {
                    not: "ACCEPTED"
                }
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
// export const editpayments = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TEditpaymentSchema>)   => {
//     try{
//         const updateData : {active: boolean, paymentName: string} | {active: boolean} = input;
//         const edittedpayment = await prisma.payments.update({
//             where:{
//                 id: input.paymentId
//             },
//             data: updateData
//         });
//         return { status: TRPCResponseStatus.SUCCESS, message:"", data: edittedpayment};
//     } catch(error) {
//         //console.log("\n\n Error in editpayments ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error)
//     }
// };

/*
Delete a payment
*/
// export const deletepayments = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TDeletepaymentSchema>)   => {
//     try{
//         await prisma.payments.delete({
//             where: {
//                 id: input.paymentId
//             }
//         });
//         return { status: TRPCResponseStatus.SUCCESS, message:"Role deleted", data: {}};
//     } catch(error) {
//         //console.log("\n\n Error in deletepayments ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error)
//     }
// };

export const initiateUavailibiltyRefund = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TInitiateUavailibiltyRefundSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        let refundTransactionId : null|number = null;

        let razorpayPaymentDetails = await prisma.payments.findFirst({
            where: {
                orderId: input.orderId,
            },
            include: {
                Orders: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if(!razorpayPaymentDetails || razorpayPaymentDetails.rzpPaymentId === null)
            throw { code: "BAD_REQUEST", message: "No valid payments"}

        if(razorpayPaymentDetails.paymentMethod != "cod" && razorpayPaymentDetails.paymentStatus != "captured")
            throw { code: "BAD_REQUEST", message: "No valid payments"}

        let refundDetails = await calculateRejectedQuantityRefundAmounts(input.orderId, true)
        
        // if(!refundDetails.refundToBank)
            // throw { code: "BAD_REQUEST", message: "No processable refund to bank available"}

        if(razorpayPaymentDetails.paymentMethod == "cod")
            refundDetails.refundToBank = 0;

        // to check for last refund process
        let existingRefundTransactionDetails = await prisma.refundTransactions.findFirst({
            where: {
                rzpPaymentId: razorpayPaymentDetails?.rzpPaymentId
            },
            orderBy: [{
                "createdAt" : "desc"
            }]
        });

        console.log("Refund DETAILS", refundDetails);

        if(!existingRefundTransactionDetails){
            // create refund record update the credit note and amounts, as a precautionary to failures
            const refundTransaction = await prisma.$transaction( async prisma => {
                const refundTransaction = await prisma.refundTransactions.create({
                    data: {
                        rzpPaymentId: razorpayPaymentDetails.rzpPaymentId!,
                        ...(refundDetails.refundToBank && {bankRefundValue: refundDetails.refundToBank}),
                        ...(refundDetails.creditNoteId && {creditNoteId: refundDetails.creditNoteId}),
                    }
                });

                if(refundDetails.refundToCredit && refundDetails.creditNoteId) {
                    await prisma.creditNotes.update({
                        where: {
                            id: refundDetails.creditNoteId
                        },
                        data: {
                            remainingValue: {increment: refundDetails.refundToCredit},
                        }
                    })
                }

                return refundTransaction;
            });
            refundTransactionId = <number><unknown>refundTransaction.id;
        } else {
            refundTransactionId = <number><unknown>existingRefundTransactionDetails.id;
        }

        if(!refundTransactionId)
            throw {code: "INTERNAL_SERVER_ERROR", message: "Refund Id missing"}
        

        if(refundDetails.refundToBank && (!existingRefundTransactionDetails || !existingRefundTransactionDetails?.rzpRefundId || existingRefundTransactionDetails?.rzpRefundStatus == "failed" || razorpayPaymentDetails.paymentMethod != "cod")) {
            
            //initiate bank refund
            const rzpRefundDetails = await initiateNormalRefund(razorpayPaymentDetails.rzpPaymentId, { amount: refundDetails.refundToBank, speed: "normal"})

            if(!rzpRefundDetails.id)
                throw { code: "INTERNAL_SERVER_ERROR", message: "Refund not processed"}
    
            // update the refund in the create record
            await prisma.$transaction( async prisma => {
                await prisma.refundTransactions.update({
                    where: {
                        id: refundTransactionId
                    },
                    data: {
                        rzpRefundId: rzpRefundDetails.id,
                        rzpRefundStatus: rzpRefundDetails.status
                    }
                });
                if(razorpayPaymentDetails.Orders.orderStatus == "CANCELED_ADMIN"){
                    await prisma.payments.update({
                        where: {
                            rzpPaymentId: razorpayPaymentDetails.rzpPaymentId!
                        },
                        data: {
                            paymentStatus: "refunded"
                        }
                    });
                };
            })

        }

        prisma.$transaction([
            ...refundDetails.updateOrderProductReimbursedQueries
        ]);

        // refund mail
        if(razorpayPaymentDetails.Orders.user?.email){
            await sendSMTPMail({
                userEmail: razorpayPaymentDetails.Orders.user?.email,
                emailBody: generateRefundNotificationEmail({
                    orderId: `${razorpayPaymentDetails.Orders.id}`,
                    orderIdVarChar: razorpayPaymentDetails.Orders.idVarChar,
                    bankRefundAmount: refundDetails.refundToBank,
                    ...(refundDetails.creditNoteId && {
                        creditNoteId: `${refundDetails.creditNoteId}`,
                        creditNoteAmount: refundDetails.refundToCredit
                    })
                })
            });
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"", data:razorpayPaymentDetails.Orders.user?.email ? "Sucessful" : "User email not present"};

    } catch(error) {
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}

export const issueReturnReplacementBankRefund = async ({ctx, input}: TRPCRequestOptions<paymentSchemas.TIssueReturnReplacementBankRefundSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        
        let refundTransactionId : null|number = null;

        const replacementOrderDetails = await prisma.replacementOrder.findFirst({
            where: {
                id: input.replacementOrderId
            },
            select: {
                id: true,
                return: {
                    select: {
                        order: {
                            select: {
                                userId: true,
                                idVarChar: true,
                                creditUtilised: true,
                                totalAmount: true,
                                id: true,
                                Payments: {
                                    select: {
                                        rzpPaymentId: true
                                    }
                                },
                                user: {
                                    select: {
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                },
                replacementItems: {
                    where: {
                        nonReplaceAction: null
                    },
                    select: {
                        nonReplacableQuantity: true,
                        returnOrderItem: {
                            select: {
                                rejectedQuantity: true,
                                quantity: true,
                                orderProduct: {
                                    select: {
                                        price: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if(!replacementOrderDetails || !replacementOrderDetails.replacementItems.length || !replacementOrderDetails.return.order.userId || !replacementOrderDetails.return.order.Payments?.rzpPaymentId )
            throw ({code: "BAD_REQUEST", message: "The order for which you are creating refund is invalid"});

        let refundAmount = replacementOrderDetails.replacementItems.reduce( (total, product) => total + (product.nonReplacableQuantity * product.returnOrderItem.orderProduct.price), 0 );
        let replaceQuantity = replacementOrderDetails.replacementItems.reduce( (total, product) => total + (product.returnOrderItem.quantity - (product.nonReplacableQuantity + (product.returnOrderItem.rejectedQuantity??0) )), 0 );

        let orderTotal = replacementOrderDetails.return.order.totalAmount;
        let creditUtilized = replacementOrderDetails.return.order.creditUtilised ?? 0;

        let bankRefund = refundAmount > orderTotal - creditUtilized ? orderTotal - creditUtilized : refundAmount;
        let creditNoteRefund = refundAmount < orderTotal - creditUtilized ? 0 : refundAmount - orderTotal + creditUtilized ;

        if(creditNoteRefund > 0 && (  !replacementOrderDetails.return.order.user || !replacementOrderDetails.return.order.user.email))
            throw { code: "BAD_REQUEEST", message: "User email id is missing"}

        let creditNoteCreated : {id: number} | null = null
        let creditNoteInput =  {
            email: replacementOrderDetails.return.order.user!.email!,
            replacementOrderId: replacementOrderDetails.id,
            value: creditNoteRefund,
            remainingValue: creditNoteRefund,
            creditNoteOrigin: prismaEnums.CreditNotePurpose.REPLACEMENT,
            userId: replacementOrderDetails.return.order.userId!,
            expiryDate: new Date( new Date().setMonth( new Date().getMonth() + Number(process.env.CREDIT_NOTE_EXPIRY) ) ),
            creditCode: `RTN-${replacementOrderDetails.return.order.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${replacementOrderDetails.return.order.userId}`
        }

        // to check for last refund process
        let existingRefundTransactionDetails = await prisma.refundTransactions.findFirst({
            where: {
                rzpPaymentId: replacementOrderDetails.return.order.Payments.rzpPaymentId
            },
            orderBy: [{
                "createdAt" : "desc"
            }]
        });

        if(!existingRefundTransactionDetails){
            // create refund record update the credit note and amounts, as a precautionary to failures
            const refundTransaction = await prisma.$transaction( async prisma => {
                if(creditNoteRefund > 0){
                    creditNoteCreated = await prisma.creditNotes.create({
                        data:creditNoteInput,
                        select: {
                            id: true
                        }
                    })
                }
                const refundTransaction = await prisma.refundTransactions.create({
                    data: {
                        rzpPaymentId: replacementOrderDetails.return.order.Payments!.rzpPaymentId!,
                        bankRefundValue: bankRefund,
                        ...(creditNoteCreated && {creditNoteId: creditNoteCreated.id}),
                    }
                });

                return refundTransaction;
            });
            refundTransactionId = <number><unknown>refundTransaction.id;
        } else {
            refundTransactionId = <number><unknown>existingRefundTransactionDetails.id;
        }

        if(!refundTransactionId)
            throw {code: "INTERNAL_SERVER_ERROR", message: "Refund Id missing"}

        //  add a precautionary failure same as the initiate Unavailability Refund function.

        if(bankRefund > 0){
            if(!existingRefundTransactionDetails || !existingRefundTransactionDetails?.rzpRefundId || existingRefundTransactionDetails?.rzpRefundStatus == "failed" ) {
            
                //initiate bank refund
                const rzpRefundDetails = await initiateNormalRefund(replacementOrderDetails.return.order.Payments.rzpPaymentId, { amount: bankRefund, speed: "normal"});
    
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
    
        }

        // if no replacement quantity is avl then the order should be assessed
        !replaceQuantity && prisma.replacementOrder.update({
            where: {
                id: input.replacementOrderId
            },
            data: {
                status: "ASSESSED"
            }
        });

        //refund 
        if(!creditNoteCreated)  
            creditNoteCreated = {id: 0}; 

        if(replacementOrderDetails.return.order.user?.email)
            await sendSMTPMail({
                userEmail: replacementOrderDetails.return.order.user?.email, 
                emailBody: generateRefundNotificationEmail({
                    orderId: `${replacementOrderDetails.return.order.id}`,
                    orderIdVarChar: replacementOrderDetails.return.order.idVarChar,
                    bankRefundAmount: bankRefund,
                    ...(creditNoteCreated.id && {
                        creditNoteId: `${creditNoteCreated.id}`,
                        creditNoteAmount: creditNoteInput.value,
                        creditNoteExpiry: creditNoteInput.expiryDate
                    })
                })
            });

            return { status: TRPCResponseStatus.SUCCESS, message:"", data: replacementOrderDetails.return.order.user?.email ? "Sucessful" : "User email not present"};


    } catch(error) {
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}