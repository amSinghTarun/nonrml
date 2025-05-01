import { Prisma, prisma, prismaTypes } from "@nonrml/prisma";
import { TEditInventoryItemSchema, TDeleteInventoryItemSchema, TGetInventoryItemSchema, TGetSKUDetailsSchema, TGetInventoryItemsSchema, TAddInventoryItemsSchema } from "./inventory.schema";
import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { cacheServicesRedisClient } from "@nonrml/cache";
const take = 20; // should come from env

/*
Get the inventory.
Cursor based pagination.
*/
export const getInventory = async ({ctx, input}: TRPCRequestOptions<TGetSKUDetailsSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const whereCondition = input.sku ? { productVariant: { product: { sku: input.sku } } } : {};
        const inventory = await prisma.inventory.findMany({
            where: whereCondition,
            select: {
                id: true,
                productVariantId: true,
                baseSkuInventoryId: true,
                quantity: true,
                lastRestockDate:true,
                lastRestockQuantity: true,
                baseSkuInventory: {
                    select: {
                        baseSku: true,
                        quantity: true,
                        color: true,
                        size: true
                    }
                },
                productVariant: {
                    select: {
                        size: true,
                        product: {
                            select: {
                                name: true,
                                colour: true,
                                sku: true
                            }
                        }
                    }
                }
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: inventory};
    } catch(error) {
        //console.log("\n\n Error in getInventory----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

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
    const prisma = ctx.prisma;
    input = input!;
    try{
        const updateData = {
            ...(!isNaN(Number(input.quantity)) && { quantity: input.quantity }),
            ...(input.productSize && { baseSkuInventoryId : null }),
            ...(input.baseSkuId && { baseSkuInventoryId : input.baseSkuId })
        }
        console.log(isNaN(Number(input.quantity)))
        const inventoryUpdated = await prisma.inventory.update({
            where: {
                id: input.id
            },
            data: updateData,
            select: {
                productVariantId: true,
                productVariant: {
                    select: {                        
                        product: {
                            select: {
                                id: true,
                                sku: true
                            }
                        }
                    }
                }
            }
        });

        if(updateData.quantity || updateData.baseSkuInventoryId){
            await cacheServicesRedisClient().del(`product_${inventoryUpdated.productVariant.product.sku}`),
            await cacheServicesRedisClient().del(`productVariantQuantity_${inventoryUpdated.productVariant.product.id}`)
        }

        input.productSize && await prisma.productVariants.update({
            where: {
                id: inventoryUpdated.productVariantId
            },
            data: {
                size: input.productSize
            }
        }) 

        return { status:TRPCResponseStatus.SUCCESS, message:"inventory item editted", data: {} }
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
    const prisma = ctx.prisma;
    input = input!;
    try{
        if(input.unlink){
            await prisma.inventory.update({
                where: {
                    id: input.id
                },
                data: {
                    baseSkuInventoryId: null
                }
            });
        } else {
            await prisma.inventory.delete({
                where: {
                    id: input.id
                }
            });
        }
       return { status: TRPCResponseStatus.SUCCESS, message:"Inventory order deleted successfully", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deleteInventoryItem ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);        
    }
};