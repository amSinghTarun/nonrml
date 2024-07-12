import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { prisma, prismaEnums, prismaTypes } from "@nonorml/prisma";
import { TRPCContext } from "../../contexts";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import { Session } from "next-auth";
import { UserFromSession } from "../../middlewares/sessionMiddleware";
import z, { unknown } from "zod";
import { TRPCResponseStatus } from "@nonorml/common";

export const SALT_SIZE = 8;

export type TRPCRequestOptions<T> = {
    ctx?: {user?: UserFromSession, prisma: typeof prisma},
    input: T
}

export const createPasswordHash = async (password: string): Promise<string> => {
    try {
        const hash  = await bcrypt.hash(password, SALT_SIZE);
        return hash;
    } catch (error) {
        throw new Error("Error creating password hash");
    }
}

export const verifyPassword = async (password: string, passwordHash: string) : Promise<Boolean> => {
    try {
        const passwordMatch = await bcrypt.compare(password, passwordHash);
        return passwordMatch;
    } catch(error) {
        throw new Error("Error verifying password");
    }
}


export const checkAdmin = async (userId: number) => { //can't this be placed in some middleware or context
    const adminId = 1 //get user id from ctx and check if it's a admin or adminApprover
    const isAdmin = await prisma.user.findUnique({
        where: {
            id: adminId
        }, 
        include: {
            roles : {
                select : {
                    roleName: true
                }
            }
        }
    });
    if(!isAdmin || isAdmin.roles.roleName == prismaEnums.UserPermissionRole.USER)
        throw new TRPCError({code:"UNAUTHORIZED", message:"You are unauthorized to perform this action"});
}

export const calculateDiscountedValue = (discountValue: number, discountType : prismaTypes.DiscountType, price: number) : number => {
    let discountAmount = discountValue;
    if(discountType == prismaEnums.DiscountType.PERCENTAGE)
        discountAmount = (price*discountValue)/100;
    return price - discountAmount;
}

export const convertErroStatusToTRPCErrorCode = (statusCode: number) : TRPC_ERROR_CODE_KEY => {
    const errorStatusToTRPCErrorCodeMap : { [ x: number ] : TRPC_ERROR_CODE_KEY } = {
        400 : "BAD_REQUEST",
        500 : "INTERNAL_SERVER_ERROR",
        501 : "NOT_IMPLEMENTED",
        401 : "UNAUTHORIZED",
        403 : "FORBIDDEN",
        404 : "NOT_FOUND",
        405 : "METHOD_NOT_SUPPORTED",
        408 : "TIMEOUT",
        409 : "CONFLICT",
        412 : "PRECONDITION_FAILED",
        413 : "PAYLOAD_TOO_LARGE",
        422 : "UNPROCESSABLE_CONTENT",
        429 : "TOO_MANY_REQUESTS",
        499 : "CLIENT_CLOSED_REQUEST"
    };
    if(!(statusCode in errorStatusToTRPCErrorCodeMap))
        statusCode = 500;
    return errorStatusToTRPCErrorCodeMap[statusCode] as TRPC_ERROR_CODE_KEY;
}

export const TRPCCustomError = (error: any) => {
    console.error(error);
    let errorBody : {code: TRPC_ERROR_CODE_KEY, message: string, cause?: unknown} = {code: "INTERNAL_SERVER_ERROR" as TRPC_ERROR_CODE_KEY, message: "Internal error occured"};
    errorBody.message = error.message ?? errorBody.message;
    errorBody.code = !isNaN(+error.code) ? convertErroStatusToTRPCErrorCode(error.code as number) : errorBody.code;
    errorBody.cause = error.cause;
    throw new TRPCError(errorBody);
}
