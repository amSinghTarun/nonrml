import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TGetUsersSchema, TChangeRoleSchema } from "./user.schema";
import { Prisma } from "@nonrml/prisma";

export const getUsers = async ({ctx, input}: TRPCRequestOptions<TGetUsersSchema>)  => {
    const prisma = ctx.prisma
    try{
        const users = await prisma.user.findMany({
            ...( input?.mobile && {where: {
                contactNumber: input.mobile.toString()
            }}),
            select: {
                id: true,
                contactNumber: true, 
                countryCode: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        order: true,
                        creditNotes: true
                    },
                },
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Details updated", data: users};

    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
    
}

export const changeRole = async ({ctx, input}: TRPCRequestOptions<TChangeRoleSchema>)  => {
    const prisma = ctx.prisma
    input = input!;
    try{
        const users = await prisma.user.update({
            where: {
                id: input?.userId
            },
            data: {
                role: input.role
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Details updated", data: users};

    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
    
}

