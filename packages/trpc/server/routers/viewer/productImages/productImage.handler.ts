import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductImageSchema, TDeleteProductImageSchema, TEditProductImageSchema } from "./productImage.schema";
import { Prisma, prisma } from "@nonorml/prisma";

/*
Add a product Image, all the images are associated with a product.
The image is uplaoded as a string|buffer|whatever.
Index are to show in the order, 0 index is the one which is used as primary index.
Process:
    upload the image to S3 and save the link in the db.
    if a error occur, like duplicate index, the image is deleted from the S3 in the error handling.
*/
export const addProductImage = async ({ctx, input}: TRPCRequestOptions<TAddProductImageSchema>) => {
    const S3Url = "";
    let imageUploadedToS3 = false;
    try{
        // upload to S3 : S3Url
        imageUploadedToS3 = true;
        const newProductImage = await prisma.productImage.create({
            data: input
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: newProductImage};
    } catch(error) {
        console.log("\n\n Error in addProductImage ----------------");
        if(imageUploadedToS3){
            console.log("Deleting the image from S3")
            // delete the image: S3Url
        }
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
    try{
        const imageEditted = await prisma.productImage.update({
            where: {
                id: input.productImageId
            }, 
            data: input
        })
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: imageEditted}
    } catch(error) {
        console.log("\n\n Error in editProductImage ----------------");
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
    try{        
        // delete the image from S3.
        await prisma.productImage.delete({
            where: {
                id: input.productImageId
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"", data: {}};
    } catch(error) {
        console.log("\n\n Error in deleteProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};