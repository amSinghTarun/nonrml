import { Prisma, prisma, prismaTypes } from "@nonrml/prisma";
import { TEditInventoryItemSchema, TDeleteInventoryItemSchema, TGetInventoryItemSchema, TGetSKUDetailsSchema, TGetInventoryItemsSchema, TUploadImageSchema } from "./homeImages.schema";
import { dataURLtoFile, TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { nullable } from "zod";
import { redis } from "@nonrml/cache";
import { getPublicURLOfImage, uploadToBucketFolder } from "@nonrml/storage";
import { TRPCError } from "@trpc/server";
const take = 20; // should come from env

/*
Get the inventory.
Cursor based pagination.
*/
export const getHomeImagesAdmin = async ({ctx, input}: TRPCRequestOptions<{}>)  => {
    const prisma = ctx.prisma;;
    try{
        const homeImages = await prisma.homePageImages.findMany({
            orderBy: [
                {active: "asc"}
            ]
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "", data: homeImages};
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
export const uploadImage = async ({ctx, input}: TRPCRequestOptions<TUploadImageSchema>)  => {
    const prisma = ctx?.prisma!
    input = input!;
    try{        
        const imageUploaded = await uploadToBucketFolder(
            `home/${ctx.user?.id}:${Date.now()}`,
            dataURLtoFile(input.image, `${Date.now()}`)
        );

        if (imageUploaded.error) {
            throw new TRPCError({ 
                code: "UNPROCESSABLE_CONTENT", 
                message: "Unable to upload image" 
            });
        }

        // Get public URL
        const { data } = await getPublicURLOfImage(imageUploaded.data.path, false);
        let imageUrl = data;
        const imageUplaoded = await prisma.homePageImages.create({
            data: {
                imageUrl: imageUrl,
                legacyType: input.legacyType,
                currentType: input.legacyType,
                active: false
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"inventory record created", data: imageUplaoded};
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
            await redis.redisClient.del(`product_${inventoryUpdated.productVariant.product.sku}`),
            await redis.redisClient.del(`productVariantQuantity_${inventoryUpdated.productVariant.product.id}`)
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