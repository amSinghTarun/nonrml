import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddSizeChartSchema, TDeleteSizeChartSchema, TEditSizeChartSchema, TGetSizeChartSchema } from "./productCategorySizes.schema";

export const getSizeChart = async ({ctx, input}: TRPCRequestOptions<TGetSizeChartSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const productCategorySizes = await prisma.sizeChart.findMany({
            where: {
                ...( input.id && {id: input.id}),
                ...( input.type && {type: input.type})
            } 
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: productCategorySizes};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error); 
    }
}

/*
add size chart for a category
*/
export const addSizeChart = async ({ctx, input}: TRPCRequestOptions<TAddSizeChartSchema>) => {
    const prisma = ctx.prisma
    input = input!
    try{
        const categoryNewRecord = await prisma.sizeChart.createMany({
            data: input
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: categoryNewRecord};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Edit the size chart
*/
export const editSizeChart = async ({ctx, input}: TRPCRequestOptions<TEditSizeChartSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{        
        const productCategoryEdited = await prisma.sizeChart.update({
            where: {
                id: input.chartId,
                type: prismaEnums.SizeType.SIZE_VALUE
            }, 
            data: {
                value: input.value.toString()
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"", data:productCategoryEdited};
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
Delete a size chart, cascade is off
*/
export const deleteSizeChart = async ({ctx, input}: TRPCRequestOptions<TDeleteSizeChartSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.sizeChart.delete({
            where: {
                id: input.id
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message:"Record deleted", data:{}}
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};