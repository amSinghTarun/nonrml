import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddBaseSkuInventorySchema, TDeleteBaseSkuInventorySchema, TEditBaseSkuInventorySchema, TGetInventoryItemSchema } from "./baseSkuInventory.schema";
import { Prisma } from "@nonrml/prisma";

/*
    Add a new review for a product
    User can only give review of a product which they have bought
*/
export const addBaseSkuInventory = (async ({ctx, input}: TRPCRequestOptions<TAddBaseSkuInventorySchema>) => {
    const prisma = ctx.prisma
    try{
        console.log(input)
        const baseSkuInventory = await prisma.baseSkuInventory.createMany({
            data: input!
        });
        
        return {status: TRPCResponseStatus.SUCCESS, message:"", data: baseSkuInventory};
    }  catch(error) {
        //console.log("\n\n Error in addReview ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw error;
    }
});

// /*
//     For a user to delete their review
// */
export const deleteBaseSkuInventory = (async ({ctx, input}: TRPCRequestOptions<TDeleteBaseSkuInventorySchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.baseSkuInventory.delete({
            where: {
                id: input.id,
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"record deleted", data:{}};
    }  catch(error) {
        //console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
});

/*
Get the inventory.
Cursor based pagination.
*/
export const getBaseInventory = async ({ctx, input}: TRPCRequestOptions<TGetInventoryItemSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const searchQuery = {
            ...(input.size && {size: input.size}),
            ...(input.color && {color: input.color}),
            ...(input.sku && {baseSku: input.sku})
        }

        console.log(searchQuery)
        
        const inventory = await prisma.baseSkuInventory.findMany({
            where: searchQuery
        });

        return { status: TRPCResponseStatus.SUCCESS, message: "", data: inventory};
    } catch(error) {
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

export const editBaseInventory = async ({ctx, input}: TRPCRequestOptions<TEditBaseSkuInventorySchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const updateData = {
            ...(input.quantity && { quantity: input.quantity }),
            ...(input.sku && { baseSku: input.sku })
        };

        if (Object.keys(updateData).length === 0) {
            throw { code: "BAD_REQUEST", message: "No data provided for update" };
        }

        const inventory = await prisma.baseSkuInventory.update({
            where: {
                id: input.baseSkuId
            },
            data: updateData
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: inventory};
    } catch(error) {
        console.log(error)
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}