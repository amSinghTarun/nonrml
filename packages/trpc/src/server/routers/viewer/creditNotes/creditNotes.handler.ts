import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { createOTP, TRPCCustomError } from "../helper";
import { TRPCRequestOptions } from "../helper";
import { TAddCreditNoteSchema, TDeleteCreditNoteItem, TGetCreditNotesAdminSchema, TGetAllCreditNotesSchema, TEditCreditNoteSchema, TGetCreditNoteSchema, TGetCreditNoteDetailsSchema } from "./creditNotes.schema";
import { TRPCResponseStatus } from "@nonrml/common";
import crypto from 'crypto';
import { cacheServicesRedisClient } from "@nonrml/cache";

export const getCreditNote = async ({ctx, input}: TRPCRequestOptions<TGetCreditNoteSchema> ) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const creditNote = await prisma.creditNotes.findFirst({
            where: {
                expiryDate: {
                    gte: `${new Date().toISOString()}`
                },
                creditCode: input?.creditNote
            },
            include: {
                creditNotesPartialUseTransactions: true
            }
        })
        if(!creditNote)
            throw new TRPCError({code:"NOT_FOUND", message: "No Credit note found for the given code"});
        if(!creditNote.remainingValue)
            throw new TRPCError({code:"FORBIDDEN", message: "Credit note is already redeemed"});
        
        let cnUsableValue = Number(creditNote.value);

        if(creditNote.creditNotesPartialUseTransactions.length != 0){
            for(let earlierTransactions of creditNote.creditNotesPartialUseTransactions){
                cnUsableValue -= Number(earlierTransactions.valueUtilised);
            }
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"Discount applied", data: { afterCnOrderValue: (input.orderValue < cnUsableValue ? 10 : input.orderValue-cnUsableValue ), usableValue: cnUsableValue}};
    } catch(error) {
        //console.log("\n\n Error in useCreditNote ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

export const sendCreditNoteOtp = async ({ctx, input}: TRPCRequestOptions<{}> ) => {
    const prisma = ctx.prisma;
    const userId = ctx.user?.id;
    input = input!;
    try{
        const attemptNumber : string|null = await cacheServicesRedisClient().get(`${userId}`);
        if(attemptNumber){
            if(Number(attemptNumber) > 5)
                throw {code:"FORBIDDEN", message: "Attempt limit exceeded"};
        }else{
            const expireUserOTPAt =  172800;
            await cacheServicesRedisClient().set(`${userId}`, '0', {ex: expireUserOTPAt})
        }

        const creditNote = await prisma.creditNotes.findFirst({
            where: {
                userId: userId
            }
        })
        if(!creditNote)
            throw new TRPCError({code:"NOT_FOUND", message: "No Credit Notes On Your Name"});
        

        const otp = createOTP(6);
        console.log("CREDIT NOTE OTP",otp);
        
        //send OTP

        //after otp successs
        await cacheServicesRedisClient().incr(`${userId}`);
        await cacheServicesRedisClient().set(`${userId}:otp`, `${otp}`, {ex: 600000})

        return { status: TRPCResponseStatus.SUCCESS, message:"SUCCESS", data: {}};
    } catch(error) {
        //console.log("\n\n Error in useCreditNote ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Get all the details with transactions and all
*/
export const getAllCreditNote = async ({ctx, input}: TRPCRequestOptions<TGetAllCreditNotesSchema>) => {
    const prisma = ctx.prisma;
    input = input!
    const userId = ctx.user?.id!;
    try{
        const otp = await cacheServicesRedisClient().get(`${userId}:otp`)
        
        if(!otp || otp != input.otp)
            throw {code: "FORBIDDEN", message:"INVALID_OTP"};

        const creditNotes = await prisma.creditNotes.findMany({
            where: {
                userId: userId
            }, 
            select: {
                creditCode: true,
                email: true
            }
        });

        return {status: TRPCResponseStatus.SUCCESS, message:"", data: creditNotes};

    } catch(error) {
        //console.log("\n\n Error in getDiscounts ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Get all the details with transactions and all
*/
export const getCreditNoteDetails = async ({ctx, input}: TRPCRequestOptions<TGetCreditNoteDetailsSchema>) => {
    const prisma = ctx.prisma;
    input = input!
    try{
        const creditNote = await prisma.creditNotes.findFirst({
            where: {
                creditCode : input?.creditNoteCode,
                user: {
                    contactNumber: input?.mobile
                }
            }, 
            include: {
                creditNotesPartialUseTransactions: true
            }
        });
        if(!creditNote)
            throw new TRPCError({code: "NOT_FOUND", message:"No Credit Note Found With Given Details"});
        return {status: TRPCResponseStatus.SUCCESS, message:"", data: creditNote};
    } catch(error) {
        //console.log("\n\n Error in getDiscounts ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
add discount in the db. Can only be done by ADMIN
*/
export const addCreditNote = async ({ctx, input}: TRPCRequestOptions<TAddCreditNoteSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        console.log(`-----Input of create credit note, ${JSON.stringify(input)}, -----------that's it`)
        let prismaUpdateQueries = []

        if(input.returnOrderId){
            const orderDetail = await prisma.returns.findUnique({
                where: {
                    id: input.returnOrderId
                },
                include: {
                    order: {
                        include: {
                            address: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                }
            })

            if(!orderDetail)
                throw ({code: "BAD_REQUEST", message: "The order for which you are creating CN is invalid"});
    
            prisma.creditNotes.create({
                data: {
                    returnOrderId: input.returnOrderId,
                    email: orderDetail.order.address.email,
                    value: orderDetail?.order.totalAmount!,
                    remainingValue: orderDetail?.order.totalAmount!,
                    creditNoteOrigin: prismaEnums.CreditNotePurpose.RETURN,
                    userId: orderDetail?.order.userId,
                    expiryDate: new Date( new Date().setMonth( new Date().getMonth() + 6 ) ),
                    creditCode: `RTN-${orderDetail.order.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${orderDetail.orderId}`
                }
            })
   
        } else if( input.userId && input.value) {
            prismaUpdateQueries.push(
                prisma.creditNotes.create({
                    data: {
                        value: input.value,
                        creditNoteOrigin: prismaEnums.CreditNotePurpose.GIFT,
                        email: input.email,
                        userId: input.userId,
                        remainingValue: input.value,
                        expiryDate: new Date( new Date().setMonth( new Date().getMonth() + 3 ) ),
                        creditCode: `GIFT-${input.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${(new Date()).toISOString().split('T')[0]!.replaceAll('-', "").slice(2)}`
                    }
                })
            )
        } else if( input.replacementOrderId) {
            
            // the whole CN and Money refund logic is not required, as only CN is allowed and whatever the CN value it can't be more
            // thn order and also it will include the old CN used value
            const replacementOrderDetails = await prisma.replacementOrder.findFirst({
                where: {
                    id: input.replacementOrderId
                },
                select: {
                    return: {
                        select: {
                            order: {
                                select: {
                                    userId: true,
                                    id: true,
                                    address: {
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

            if(!replacementOrderDetails || !replacementOrderDetails.replacementItems.length)
                throw ({code: "BAD_REQUEST", message: "The order for which you are creating CN is invalid"});

            let refundAmount = replacementOrderDetails.replacementItems.reduce( (total, product) => total + (product.nonReplacableQuantity * product.returnOrderItem.orderProduct.price), 0 );
            let replaceQuantity = replacementOrderDetails.replacementItems.reduce( (total, product) => total + (product.returnOrderItem.quantity - (product.nonReplacableQuantity + (product.returnOrderItem.rejectedQuantity??0) )), 0 );
            
            prismaUpdateQueries.push( 
                prisma.creditNotes.create({
                    data: {
                        value: refundAmount,
                        remainingValue: refundAmount,
                        email: replacementOrderDetails.return.order.address.email,
                        creditNoteOrigin: prismaEnums.CreditNotePurpose.REPLACEMENT,
                        userId: replacementOrderDetails.return.order.userId,
                        replacementOrderId: input.replacementOrderId,
                        expiryDate: new Date( new Date().setMonth( new Date().getMonth() + 3 ) ),
                        creditCode: `RPL-${replacementOrderDetails.return.order.userId}${crypto.randomBytes(1).toString('hex').toUpperCase()}${replacementOrderDetails.return.order.id}`
                    }
                }),
                prisma.replacementItem.updateMany({
                    where: {
                        replacementOrderId: input.replacementOrderId,
                        nonReplacableQuantity: { gt: 0 } // to filter the item which actually are non replacable
                    },
                    data: {
                        nonReplaceAction: prismaEnums.NonReplaceQantityAction.CREDIT
                    }
                })
            )

            // if the replaceQuantity is zero then make the status of replacement as ASSESSED coz nothing is left to replace
            !replaceQuantity && prismaUpdateQueries.push(
                prisma.replacementOrder.update({
                    where: {
                        id: input.replacementOrderId
                    },
                    data: {
                        status: "ASSESSED"
                    }
                })
            )
        }

        const creditNote = await prisma.$transaction(prismaUpdateQueries);

        return {status: TRPCResponseStatus.SUCCESS, message: "Discount added", data: creditNote};

    } catch(error) {
        //console.log("\n\n Error in addDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);    
    }
}

/*
edit the db discount, ADMIN method
Any discount detail can be edited, wether it be it's condition or discount property
Directly update the discount, if the discount or it's corresponding condition doesn't exist
then it will be caught in error
*/
export const editCreditNote = async ({ctx, input}: TRPCRequestOptions<TEditCreditNoteSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        console.log(input)
        const updateData = {
            ...(input.value && { value: input.value}),
            ...(input.expiryDate && { expiryDate: input.expiryDate}),
            ...(!isNaN(Number(input.remainingValue)) && { redeemed: input.remainingValue}),
        }

        if(Object.keys(updateData).length == 0)
            throw {code: "BAD_REQUEST", message: "Empty update payload"}
        console.log(updateData)
        const discountEditted = await prisma.creditNotes.update({
            where: {
                id: input.id
            },
            data: updateData
        })
    
        return {status: TRPCResponseStatus.SUCCESS, message:"Discount editted", data: discountEditted}
    } catch(error) {
        //console.log("\n\n Error in editDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Delete a respective discount
*/
export const deleteCreditNote = async ({ctx, input}: TRPCRequestOptions<TDeleteCreditNoteItem>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.creditNotes.delete({
            where: {
                id: input.id
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"Discount deleted", data: {}}
    }catch(error){
        //console.log("\n\n Error in deleteDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

export const getCreditNotesAdmin = async ({ctx, input} : TRPCRequestOptions<TGetCreditNotesAdminSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const creditNotes = await prisma.creditNotes.findMany({
            where: {
                ...( input.userId && { userId: input.userId} ),
                ...( input.orderId && { returnOrder: {orderId: input.orderId} }),
                ...( input.creditNoteCode && { creditCode: input.creditNoteCode }),
            },
            include: {
                creditNotesPartialUseTransactions: true
            }
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"Discount editted", data: creditNotes};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}