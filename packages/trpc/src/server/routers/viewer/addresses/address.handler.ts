import { Prisma } from "@nonrml/prisma";
import { TAddAddressSchema, TDeleteAddressSchema, TEditAddressByAdmin, TEditAddressSchema, TGetUserAddressSchema } from "./address.schema";
import { TRPCError } from "@trpc/server";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus } from "@nonrml/common";

/*
Get the a particular user address
userId is taken form the ctx to ensure no other user can see address of anyone else
*/
export const getUserAddress = async ({ctx, input}: TRPCRequestOptions<TGetUserAddressSchema>)  => {
    const prisma = ctx.prisma;
    try{
        const userId = input?.userId
        const address = await prisma.address.findMany({
            where: {
                userId: userId
            }
        })
        if(!address)
            throw TRPCCustomError({code: 404, message: "So such address"});
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: address};
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    }
};

/*
Get the addresses of user
get the userId from the ctx 
*/
export const getAddresses = async ({ ctx }: TRPCRequestOptions<null>) => {
    const prisma = ctx.prisma;
    const userId = +ctx.user?.id!
    try{
        const addresses = await prisma.address.findMany({
            where: {
                userId: userId
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: addresses}
    } catch(error) {
        //console.log("\n\n Error in getAddresses ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    }
};

/*
Add address for a user, 
1 user can have only 1 address with a particular addressName
*/
export const addAddress = async ({ctx, input}: TRPCRequestOptions<TAddAddressSchema>)  => {
    const prisma = ctx.prisma;
    const userId = +ctx.user?.id!
    try{
        const newAddress = await prisma.address.create({
            data: {...input!, userId: userId}
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "address created successfully", data: newAddress};
    } catch(error) {
        //console.log("\n\n Error in addAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            error = { code:"BAD_REQUEST", message: error.message, cause: error.meta?.cause };
        }
        throw error;
    }
}

/*
Delete address of a user
*/
export const removeAddress = async ({ctx, input}: TRPCRequestOptions<TDeleteAddressSchema>)  => {
    const prisma = ctx.prisma;
    const userId = +ctx.user?.id!
    try{
        await prisma.address.delete({
            where: {
                id: input!.id,
                userId: userId
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Address deleted", data: {}};
    } catch(error) {
        //console.log("\n\n Error in addAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    }
}

/*
Edit address of an user
*/
export const editAddress = async ({ctx, input}: TRPCRequestOptions<TEditAddressSchema>) => {
    const prisma = ctx.prisma;
    const userId = +ctx.user?.id!
    try{
        const editedAddress = {...input};
        const newAddress = await prisma.address.update({
            where: {
                id: userId
            }, 
            data : editedAddress
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"Address edited Successfully", data: newAddress};
    } catch(error) {
        //console.log("\n\n Error in editAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    };
}

/*
Edit address of an user
*/
export const editAddressByAdmin = async ({ctx, input}: TRPCRequestOptions<TEditAddressByAdmin>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const editedAddress = {...input};
        const newAddress = await prisma.address.update({
            where: {
                id: input.id
            }, 
            data : editedAddress
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"Address edited Successfully", data: newAddress};
    } catch(error) {
        //console.log("\n\n Error in editAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    };
}