import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductImageSchema, TDeleteProductImageSchema, TEditImagePriorityIndexImageSchema, TEditProductImageSchema } from "./productImage.schema";
import { Prisma, prismaEnums } from "@nonrml/prisma";
import { getPublicURLOfImage, uploadToBucketFolder } from "@nonrml/storage";
import { dataURLtoFile } from "@nonrml/common";
import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
import { TRPC_ERROR_CODE_KEY, TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";

/*
Add a product Image, all the images are associated with a product.
The image is uplaoded as a string|buffer|whatever.
Index are to show in the order, 0 index is the one which is used as primary index.
Process:
    upload the image to S3 and save the link in the db.
    if a error occur, like duplicate index, the image is deleted from the S3 in the error handling.

    NOOOOOOO

    Make that logic different, i mean the logic of uplaoding to s3
*/

export const addProductImage = async ({ctx, input}: TRPCRequestOptions<TAddProductImageSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const imageUplaoded = await uploadToBucketFolder(`PROD_IMAGE:${input.productSku}:${Date.now()}`, dataURLtoFile(input.image, `${input.productId}:${Date.now()}`), true);
        
        if(imageUplaoded.error)
            throw { code: "UNPROCESSABLE_CONTENT", message: JSON.stringify(imageUplaoded.error)};

        const {data: imageUrl} = await getPublicURLOfImage(imageUplaoded.data.path, true);
        console.log(imageUrl);
        const newProductImage = await prisma.productImage.create({
            data: {
                image: imageUrl.publicUrl,
                priorityIndex: input.priorityIndex,
                productId: input.productId,
                active: input.active
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: {}};
    } catch(error) {
        //console.log("\n\n Error in addProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Edit the priority index of an image.
You cannot the product with which image is associated, to associate the image with another product, you have to delete it
and then again uplaod it.
*/
export const editProductImage = async ({ctx, input}: TRPCRequestOptions<TEditProductImageSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        const updateData = {
            ...(("priorityIndex" in input) && {priorityIndex: input.priorityIndex}),
            ...(("active" in input) && {active: input.active})
        } as const;

        const imageEditted = await prisma.productImage.update({
            where: {
                id: input.productImageId
            }, 
            data: updateData
        })
        console.log(input, imageEditted)
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: imageEditted}
    } catch(error) {
        //console.log("\n\n Error in editProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Delete the Product Image.
Deletes from DB and S3 as well.
*/
export const deleteProductImage = async ({ctx, input}: TRPCRequestOptions<TDeleteProductImageSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{        
        // delete the image from S3.
        await prisma.productImage.delete({
            where: {
                id: input.productImageId
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deleteProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

export const editImagePriorityIndexImage = async ({ctx, input}:  TRPCRequestOptions<TEditImagePriorityIndexImageSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        for(let image of Object.keys(input)){
            await prisma.productImage.update({
                where: {
                    id: +image
                },
                data: {
                    priorityIndex: input[+image]
                }
            });
        }
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: {}};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}