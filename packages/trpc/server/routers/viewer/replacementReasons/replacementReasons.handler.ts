import { TRPCResponseStatus } from "@nonorml/common";
import { Prisma, prisma } from "@nonorml/prisma";
import { TAddReplacemReasonsSchema, TDeleteReplacementReasonsSchema, TEditReplacementReasonsSchema } from "./replacementReasons.schema";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCError } from "@trpc/server";

/*
    Get the replacement reasons
*/
export const getReplacementReasons = async (ctx: {})   => {
    try{
        const rReason = await prisma.replacementReason.findMany();
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:rReason};
    } catch(error) {
        console.log("\n\n Error in getReplacementReasons ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Add a new replacement reason
*/
export const addReplacementReasons = async ({ctx, input}: TRPCRequestOptions<TAddReplacemReasonsSchema>)   => {
    try{        
        const rReason = await prisma.replacementReason.create({
            data: input
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:rReason};
    } catch(error) {
        console.log("\n\n Error in addReplacementReasons ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Edit replacement reason
*/
export const editReplacementReasons = async ({ctx, input}: TRPCRequestOptions<TEditReplacementReasonsSchema>)   => {
    try{
        const rReasonEditted = await prisma.replacementReason.update({
            where: {
                id: input.recordId
            },
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:rReasonEditted};
    } catch(error) {
        console.log("\n\n Error in editReplacementReason ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Delete a replacement reason
*/
export const deleteReplacementReasons = async ({ctx, input}: TRPCRequestOptions<TDeleteReplacementReasonsSchema>)   => {
    try{        
        await prisma.replacementReason.delete({
            where: {
                id: input.recordId
            }
        })    
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:{}};
    } catch(error) {
        console.log("\n\n Error in deleteReplacementReason ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};