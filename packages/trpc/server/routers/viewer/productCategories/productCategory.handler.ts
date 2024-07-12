import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { Prisma, prisma } from "@nonorml/prisma";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductCategorySchema, TDeleteProductCategorySchema, TEditProductCategorySchema } from "./productCategory.schema";
import { TRPCError } from "@trpc/server";

/*
Get all the product categories with their size chart
*/
export const getProductCategories = async (ctx: {})   => {
    try{
        const productCategories = await prisma.productCategories.findMany({
            include: {
                categorySizes: true
            }
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:productCategories};
    } catch(error) {
        console.log("\n\n Error in getProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Add a new product category, must select a size chart to associate with the category
So if adding something completely new, first the size chart must be created then the category 
*/
export const addProductCategories = async ({ctx, input}: TRPCRequestOptions<TAddProductCategorySchema>)   => {
    try{
        const categoryNewRecord = await prisma.productCategories.create({
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:categoryNewRecord};
    } catch(error) {
        console.log("\n\n Error in addProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Edit the category
*/
export const editProductCategories = async ({ctx, input}: TRPCRequestOptions<TEditProductCategorySchema>)   => { 
    try{
        const productCategoryEdited = await prisma.productCategories.update({
            where: {
                id: input.productCategoryId
            }, 
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:productCategoryEdited};
    } catch(error) {
        console.log("\n\n Error in editProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Delete the category, cascade is not required, not used anywhere as a foreign key
*/
export const deleteProductCategories = async ({ctx, input}: TRPCRequestOptions<TDeleteProductCategorySchema>)   => {
    try{
        await prisma.productCategories.delete({
            where: {
                id: input.id
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"Record deleted", data:{}}
    } catch(error) {
        console.log("\n\n Error in deleteProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}