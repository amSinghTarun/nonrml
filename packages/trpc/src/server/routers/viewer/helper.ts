import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { prismaEnums, prismaTypes } from "@nonrml/prisma";
import { TRPCContext, AuthedContext } from "../../contexts";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";;;

export const SALT_SIZE = 8;

export type TRPCRequestOptions<T> = {
    ctx: TRPCContext,
    input?: T
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


// export const checkAdmin = async (userId: number) => { //can't this be placed in some middleware or context
//     const adminId = 1 //get user id from ctx and check if it's a admin or adminApprover
//     const isAdmin = await prisma.user.findUnique({
//         where: {
//             id: adminId
//         }, 
//         include: {
//             roles : {
//                 select : {
//                     roleName: true
//                 }
//             }
//         }
//     });
//     if(!isAdmin || isAdmin.roles.roleName == prismaEnums.UserPermissionRole.USER)
//         throw new TRPCError({code:"UNAUTHORIZED", message:"You are unauthorized to perform this action"});
// }

export const jsonArrayFieldsToStringArray = (jsonArray: {[key: string]: any}[], fieldName: string) : string[] => {
    let stringOfField : string[] = [];
    for(let x of jsonArray){
        if(fieldName in x){
            stringOfField = [...stringOfField, x[fieldName]!]
        }
    }
    return stringOfField;
}

jsonArrayFieldsToStringArray([{"dsdsa":"fdfds"}], ":dfsdasd")

export const calculateDiscountedValue = (discountValue: number, discountType : prismaTypes.DiscountType, price: number) : number => {
    let discountAmount = discountValue;
    if(discountType == prismaEnums.DiscountType.PERCENTAGE)
        discountAmount = (price*discountValue)/100;
    return price - discountAmount;
}

export const convertTRPCErrorCodeToStatusCode = (statusCode: number) => {
    const errorStatusToTRPCErrorCodeMap : { [ x: string ] : number } = {
       "BAD_REQUEST" : 400,
       "INTERNAL_SERVER_ERROR" : 500,
       "NOT_IMPLEMENTED" : 501,
       "UNAUTHORIZED" : 401,
       "FORBIDDEN" : 403,
       "NOT_FOUND" : 404,
       "METHOD_NOT_SUPPORTED" : 405,
       "TIMEOUT" : 408,
       "CONFLICT" : 409,
       "PRECONDITION_FAILED" : 412,
       "PAYLOAD_TOO_LARGE" : 413,
       "UNPROCESSABLE_CONTENT" : 422,
       "TOO_MANY_REQUESTS" : 429,
       "CLIENT_CLOSED_REQUEST" : 499 
    };
    if(!(statusCode in errorStatusToTRPCErrorCodeMap))
        statusCode = 500;
    return errorStatusToTRPCErrorCodeMap[statusCode]!;
}

export const TRPCCustomError = (error: any) => {
    //console.log(error, "\n --------------------------------------------------")
    //console.log(error.code)
    const errorCode = error.code ? convertTRPCErrorCodeToStatusCode(error.code) : 500;
    const finalError = new Error(errorCode != 500 ? error.message : "Having some issue rn, Try after sometime");
    finalError.code = errorCode;
    finalError.cause = error.cause ?? null;
    throw finalError;
}
