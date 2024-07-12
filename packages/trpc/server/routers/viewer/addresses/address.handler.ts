import { Prisma, prisma } from "@nonorml/prisma";
import { TAddAddressSchema, TAddressOutputSchema, TDeleteAddressSchema, TEditAddressSchema, TGetAddressesOutputSchema, TGetAddressesSchema, TGetAddressSchema } from "./address.schema";
import { TRPCError } from "@trpc/server";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus } from "@nonorml/common";

/*
Get the a particular user address
userId is taken form the ctx to ensure no other user can see address of anyone else
*/
export const getAddress = async ({ctx, input}: TRPCRequestOptions<TGetAddressSchema>)  => {
    try{
        const userId = ctx?.user?.id
        const address = await prisma.address.findUnique({
            where: {
                id: input.addressId,
                userId: userId
            }
        })
        if(!address)
            throw new TRPCError({code: "NOT_FOUND", message: "So such address"});
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: address};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Get the addresses of user
get the userId from the ctx 
*/
export const getAddresses = async ({ctx, input}: TRPCRequestOptions<TGetAddressesSchema>) => {
    try{
        const addresses = await prisma.address.findMany({
            where: {
                userId: ctx?.user?.id 
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: addresses}
    } catch(error) {
        console.log("\n\n Error in getAddresses ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Add address for a user, 
1 user can have only 1 address with a particular addressName
*/
export const addAddress = async ({ctx, input}: TRPCRequestOptions<TAddAddressSchema>)  => {
    try{
        const userId = ctx?.user?.id!;
        const newAddress = await prisma.address.create({
            data: {...input, userId}
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "address created successfully", data: newAddress};
    } catch(error) {
        console.log("\n\n Error in addAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            error = { code:"BAD_REQUEST", message: error.message, cause: error.meta?.cause };
        }
        throw TRPCCustomError(error);
    }
}

/*
Delete address of a user
*/
export const removeAddress = async ({ctx, input}: TRPCRequestOptions<TDeleteAddressSchema>)  => {
    try{
        await prisma.address.delete({
            where: {
                id: input.id
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Address deleted", data: {}};
    } catch(error) {
        console.log("\n\n Error in addAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Edit address of an user
*/
export const editAddress = async ({ctx, input}: TRPCRequestOptions<TEditAddressSchema>) => {
    try{
        // const userId = ctx?.user?.id!;
        // const address = await prisma.address.findFirst({
        //     where : {
        //         userId: userId,
        //         id: input.id
        //     }
        // })
        // if(!address) 
        //     throw new TRPCError({code: "NOT_FOUND", message: "No such address exist to edit"});
    
        const editedAddress : Omit<TEditAddressSchema, "id"> = {...input};
        const newAddress = await prisma.address.update({
            where: {
                id: input.id
            }, 
            data : editedAddress
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"Address edited Successfully", data: newAddress};
    } catch(error) {
        console.log("\n\n Error in editAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    };
}