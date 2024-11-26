import { Prisma, prisma, prismaTypes } from "@nonrml/prisma";
import { TAddInventoryItemSchema, TEditInventoryItemSchema, TDeleteInventoryItemSchema, TGetInventoryItemSchema, TGetSKUDetailsSchema, TGetInventoryItemsSchema, TAddInventoryItemsSchema } from "./inventory.schema";
import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
const take = 20; // should come from env

/*
Get the inventory.
Cursor based pagination.
*/
export const getInventory = async ({ctx, input}: TRPCRequestOptions<TGetInventoryItemsSchema>)  => {
    try{
                // const category = await prisma.productCategories.findUnique({
        //     where: {
        //         id: input.categoryId
        //     }
        // });
        // if(!category)
        //     throw new TRPCError({code: "NOT_FOUND", message:"No category for the selected category id"});

        let findQuery : { take: number, skip: number, cursor: { id: number } } | { take: number } = input.lastId ? { 
            take: input.back ? -1 * take : take,
            skip: 1,
            cursor: {
                id: input.lastId
            }
         } : {
            take: input.back ? -1 * take : take
        };
        const inventory = await prisma.inventory.findMany(findQuery);
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: inventory};
    } catch(error) {
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Get a single inventory item
*/
export const getInventoryItem = async ({ctx, input} : TRPCRequestOptions<TGetInventoryItemSchema>)  => {
    try{
        const inventoryItem = await prisma.inventory.findUniqueOrThrow({
            where: {
                id: input.inventoryItemId
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: inventoryItem};
    } catch(error) {
        //console.log("\n\n Error in getInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Get the details of a particular SKU
*/
export const getSKUDetails = async ({ctx, input}: TRPCRequestOptions<TGetSKUDetailsSchema>)  => {
    try{
        const skuDetails = await prisma.inventory.findUniqueOrThrow({
            where: {
                sku: input.sku
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data:skuDetails};
    } catch(error) {
        //console.log("\n\n Error in getSKUDetails ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};

/*
Add item to inventory
*/
export const addInventoryItems = async ({ctx, input}: TRPCRequestOptions<TAddInventoryItemsSchema>)  => {
    try{        
        const prisma = ctx?.prisma!
        // The prisma will autocheck, no need of extra load
        // await prisma.productCategories.findUniqueOrThrow({
        //     where: {
        //         id: input.categoryId
        //     }
        // });
        const inventoryRecord = await prisma.inventory.createMany({
            data: input!
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"inventory record created", data: inventoryRecord};
    } catch(error) {
        //console.log("\n\n Error in addInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};

/*
Edit item in inventory,
No need to find before update, as the error handling will tackle not found condition(P2025) while updating.
*/
export const editInventoryItem = async ({ctx, input}: TRPCRequestOptions<TEditInventoryItemSchema>)  => {
    try{
        const inventoryItemEditted = await prisma.inventory.update({
            where: {
                id: input.id
            },
            data: input 
        });
        return { status:TRPCResponseStatus.SUCCESS, message:"inventory item editted", data: inventoryItemEditted }
    } catch(error) {
        //console.log("\n\n Error in editInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};

/*
Delete the item from the inventory,
*/
export const deleteInventoryItem = async ({ctx, input}: TRPCRequestOptions<TDeleteInventoryItemSchema>)  => {
    try{
        await prisma.inventory.delete({
            where: {
                id: input.id
            }
        });
       return { status: TRPCResponseStatus.SUCCESS, message:"Inventory order deleted successfully", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deleteInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};