import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { Prisma, prisma } from "@nonrml/prisma";
import { jsonArrayFieldsToStringArray, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductCategorySchema, TDeleteProductCategorySchema, TEditProductCategorySchema, TGetProductCategorySchema } from "./productCategory.schema";
import { redis } from "@nonrml/cache";

/*
Get all the product categories with their size chart
*/
export const getProductCategories = async ({ctx, input}: TRPCRequestOptions<TGetProductCategorySchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const productCategories = await prisma.productCategory.findMany({
            where: { ...(!input.all && {parentId: { not: null }}) }
        }); 

        let categoryNameArray = jsonArrayFieldsToStringArray(productCategories, "displayName");
        //sets the cache async 
        if(!input.all){
            redis.redisClient.set("productCategory", categoryNameArray, {ex: 60*60*24});
        }
        
        return {status: TRPCResponseStatus.SUCCESS, message:"", data: {categoryNameArray}, adminCategories: productCategories};
    } catch(error) {
        //console.log("\n\n Error in getProductCategories ----------------");
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
    const prisma = ctx.prisma;
    input = input!;
    try{
        console.log(input)
        const categoryNewRecord = await prisma.productCategory.create({
            data: {
                categoryName: input.categoryName,
                displayName: input.displayName,
                ...(input.parentId && {parentId: input.parentId})
            }
        });

        return {status: TRPCResponseStatus.SUCCESS, message:"", data:categoryNewRecord};

    } catch(error) {
        //console.log("\n\n Error in addProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Edit the category
*/
export const editProductCategories = async ({ctx, input}: TRPCRequestOptions<TEditProductCategorySchema>)   => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const productCategoryEdited = await prisma.productCategory.update({
            where: {
                id: input.productCategoryId
            }, 
            data: {
                sizeChartId: input.sizeChartId < 0 ? null : input.sizeChartId
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:productCategoryEdited};
    } catch(error) {
        //console.log("\n\n Error in editProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Delete the category, cascade is not required, not used anywhere as a foreign key
*/
export const deleteProductCategories = async ({ctx, input}: TRPCRequestOptions<TDeleteProductCategorySchema>)   => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.productCategory.delete({
            where: {
                id: input.id
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"Record deleted", data:{}}
    } catch(error) {
        //console.log("\n\n Error in deleteProductCategories ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}