import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { TRPCCustomError } from "../helper";
import { TRPCRequestOptions } from "../helper";
import { TAddDiscountSchema, TDeleteDiscountItem, TEditDiscountSchema, TGetCreditNoteSchema, TGetCreditNoteDetailsSchema } from "./creditNotes";
import { TRPCResponseStatus } from "@nonrml/common";

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
        if(creditNote.redeemed)
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
export const addDiscount = async ({ctx, input}: TRPCRequestOptions<TAddDiscountSchema>)  => {
    try{
        const discount = await prisma.discounts.create({
            data: input
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "Discount added", data: discount};
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
export const editDiscount = async ({ctx, input}: TRPCRequestOptions<TEditDiscountSchema>)   => {
    try{
        const discountEditted = await prisma.discounts.update({
            where: {
                id: input.id
            },
            data: input
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
export const deleteDiscount = async ({ctx, input}: TRPCRequestOptions<TDeleteDiscountItem>)   => {
    try{
        await prisma.discounts.delete({
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