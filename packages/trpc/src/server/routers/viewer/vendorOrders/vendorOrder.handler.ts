import { Prisma } from "@nonrml/prisma";
import { TDeleteVendorOrder, TPlaceVendorOrder, TPlaceVendorOrderOutputSchema, TUpdateVendorOrder, TUpdateVendorOrderOutputSchema } from "./vendorOrder.schema";
import { TRPCError } from "@trpc/server";
import {  TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";

/*
    to keep the record of the vendor orders
*/
export const placeVendorOrder = async ({ctx, input}: TRPCRequestOptions<TPlaceVendorOrder>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const vendorOrder = await prisma.vendorOrder.create({
            data: {...input, totalPrice: input.totalPrice as unknown as number, advPayment: input.advPayment as unknown as number}
        });
    
        return { status: TRPCResponseStatus.SUCCESS, message:"vendor order cretaed", data: vendorOrder};
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
    update the vendor order
*/
export const updateVendorOrder = async ({ctx, input}: TRPCRequestOptions<TUpdateVendorOrder>)  => {
    const prisma = ctx.prisma
    input = input!;
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
            data: { ...input, 
                totalPrice: input.totalPrice as unknown as number,
                advPayment: input.advPayment as unknown as number,
                finalPayment: input.finalPayment as unknown as number
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "Vendor order updated", data: vOrderUpdated};
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
    Delete the vendor order
*/
export const deleteVendorOrder = async ({ctx, input}: TRPCRequestOptions<TDeleteVendorOrder>) => {
    const prisma = ctx.prisma
    input = input!
    try{
        await prisma.vendorOrder.delete({
            where: {
                id: input.id
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"Vendor order deleted", data: {}};
    } catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}