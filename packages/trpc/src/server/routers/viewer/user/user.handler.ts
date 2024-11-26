import { createError, TRPCAPIResponse, TRPCResponseStatus } from "@nonrml/common";
import { createPasswordHash, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TActivateUserAccountSchema, TEditUserPersonalInfoSchema, TSendActivationLinkSchema,  } from "./user.schema";
import { TRPCError } from "@trpc/server";
import { Prisma, prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import * as crypto from "crypto";

/*
    Edit the personal details of a user
    Process:
        email change: See if email already exist
        mobile change: See if mobile already exist
*/
export const editUserPersonalInfo = async ({ctx, input}: TRPCRequestOptions<TEditUserPersonalInfoSchema>)  => {
    try{
        if(input.email){
            const emailExist = ctx?.prisma.user.findUnique({
                where: {
                    email: input.email
                }
            });
            if(emailExist)
                throw new TRPCError({code: "FORBIDDEN", message: "Email already exist"});
        } 
        if(input.contactNumber) {
            const contactNumberExist = ctx?.prisma.user.findUnique({
                where: {
                    contactNumber: input.contactNumber
                }
            });
            if(contactNumberExist)
                throw new TRPCError({code: "FORBIDDEN", message: "Contact number already exist"}); 
        }
        if(input.password){
            input.password = await createPasswordHash(input.password);
        }

        let userAccountState : prismaTypes.UserAccountStatus = prismaEnums.UserAccountStatus.PENDING;
        if(input.firstName || input.lastName)
            userAccountState = prismaEnums.UserAccountStatus.ACTIVE;

        const user = await ctx?.prisma.user.update({
            where: {
                id: ctx.user?.id
            },
            data: {
                ...input,
                status: userAccountState
            }
        });

        if(userAccountState == prismaEnums.UserAccountStatus.PENDING)
            sendActivationLink({ ctx, input: {email: input.email ?? ctx?.user?.email!, id: ctx?.user?.id!}});

        return { status: TRPCResponseStatus.SUCCESS, message: "Details updated", data: user};

    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
    
}

export const sendActivationLink = async ({ctx, input}: TRPCRequestOptions<TSendActivationLinkSchema>) => {
    const serverUrl = 'http://localhost:3000';
    
    const activationToken = { token: `${crypto.randomBytes(8).toString("hex")}${input.id+2}:${crypto.randomBytes(8).toString("hex")}`};
    const activationLink = `${serverUrl}/activateUser?input=${encodeURIComponent(JSON.stringify(activationToken))}`;

    // send mail with activation link to the user mail id, add a request to the activateUserProfile with 
    // jwt in body, which will have the userid in it, so just update the status to active  


};

export const activateUserAccount = async ({ctx, input}: TRPCRequestOptions<TActivateUserAccountSchema>) => {
    try{
        const userId = <number><unknown>input.token.split(":")[0]?.slice(-2) - 2;
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                status: prismaEnums.UserAccountStatus.ACTIVE
            }
        })
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};