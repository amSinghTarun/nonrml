import { Prisma, prisma } from "@nonorml/prisma";
import { TDeleteVendorOrder, TPlaceVendorOrder, TPlaceVendorOrderOutputSchema, TUpdateVendorOrder, TUpdateVendorOrderOutputSchema } from "./vendorOrder.schema";
import { TRPCError } from "@trpc/server";
import { checkAdmin, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";

/*
    to keep the record of the vendor orders
*/
export const placeVendorOrder = async ({ctx, input}: TRPCRequestOptions<TPlaceVendorOrder>)  => {
    try{
        const vendorOrder = await prisma.vendorOrder.create({
            data: input
        });
    
        return { status: TRPCResponseStatus.SUCCESS, message:"vendor order cretaed", data: vendorOrder};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
    update the vendor order
*/
export const updateVendorOrder = async ({ctx, input}: TRPCRequestOptions<TUpdateVendorOrder>)  => {
    try {
        const vOrder = await prisma.vendorOrder.findUnique({
            where: {
                id: input.id
            }
        });
        if(!vOrder)
            throw new TRPCError({code:"NOT_FOUND", message: "No such order exist to edit"});
        const vOrderUpdated = await prisma.vendorOrder.update({
            where : {
                id: vOrder.id
            }, 
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "Vendor order updated", data: vOrderUpdated};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
    Delete the vendor order
*/
export const deleteVendorOrder = async ({ctx, input}: TRPCRequestOptions<TDeleteVendorOrder>) => {
    try{
        await prisma.vendorOrder.delete({
            where: {
                id: input.id
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"Vendor order deleted", data: {}};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}