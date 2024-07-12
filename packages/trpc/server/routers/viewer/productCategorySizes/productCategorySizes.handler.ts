import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { Prisma, prisma } from "@nonorml/prisma";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductCategorySizeSchema, TDeleteProductCategorySizeSchema, TEditProductCategorySizeSchema } from "./productCategorySizes.schema";

/*
add size chart for a category
*/
export const addProductCategorySizes = async ({ctx, input}: TRPCRequestOptions<TAddProductCategorySizeSchema>) => {
    try{
        const categoryNewRecord = await prisma.productCategorySizes.create({
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: categoryNewRecord};
    } catch(error) {
        console.log("\n\n Error in addProductCategorySizes ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Edit the size chart
*/
export const editProductCategorySizes = async ({ctx, input}: TRPCRequestOptions<TEditProductCategorySizeSchema>) => {
    try{        
        const productCategoryEdited = await prisma.productCategorySizes.update({
            where: {
                id: input.categorySizeId
            }, 
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:productCategoryEdited};
    } catch(error) {
        console.log("\n\n Error in editProductCatergorySizes ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Delete a size chart, cascade is off
*/
export const deleteProductCategorySizes = async ({ctx, input}: TRPCRequestOptions<TDeleteProductCategorySizeSchema>) => {
    try{
        await prisma.productCategorySizes.delete({
            where: {
                id: input.id
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"Record deleted", data:{}}
    } catch(error) {
        console.log("\n\n Error in deleteProductCategorySizes ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};