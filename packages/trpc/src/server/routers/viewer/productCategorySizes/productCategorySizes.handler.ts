import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddSizeChartSchema, TDeleteSizeChartSchema, TEditSizeChartSchema, TGetProductSizeChartSchema, TGetSizeChartSchema } from "./productCategorySizes.schema";
import { cacheServicesRedisClient } from "@nonrml/cache";

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

/*
Delete a size chart, cascade is off
*/
export const getProductSizeChart = async ({ctx, input}: TRPCRequestOptions<TGetProductSizeChartSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let sizeChart : {chartName: string, measurements: { name: string, sizeValues: {size: string, value: string}[]}[]} | null = await cacheServicesRedisClient().get(`categorySizeChart_${input.sizeChartCategoryNameId}`);
        if (!sizeChart) {

            const sizeChartData = await prisma.sizeChart.findUnique({
                where: {
                id: input.sizeChartCategoryNameId,
                type: "DISPLAY_NAME"
                },
                include: {
                other_SizeChart: {
                    where: {
                    type: "MEASUREMENT_TYPE"
                    },
                    include: {
                    other_SizeChart: {
                        where: {
                        type: "SIZE_VALUE"
                        },
                        orderBy: {
                        sortOrder: 'asc'
                        }
                    }
                    },
                    orderBy: {
                    sortOrder: 'asc'
                    }
                }
                }
            });

            if (!sizeChartData) return null;
    
            sizeChart = {
                chartName: sizeChartData.name,
                measurements: sizeChartData.other_SizeChart.map(measurementType => ({
                    name: measurementType.name,
                    sizeValues: measurementType.other_SizeChart.map(sizeValue => ({
                        size: sizeValue.name,
                        value: sizeValue.value || ''
                    }))
                }))
            };

            cacheServicesRedisClient().set(`categorySizeChart_${input.sizeChartCategoryNameId}`, sizeChart, {ex: 60*60*5});
        }

        return {status: TRPCResponseStatus.SUCCESS, message:"Record deleted", data: sizeChart}
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};