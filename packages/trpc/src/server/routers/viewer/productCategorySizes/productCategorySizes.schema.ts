import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";


export const ZGetSizeChartSchema = z.object({
    id: z.number().optional(),
    type: z.enum(Object.keys(prismaEnums.SizeType) as [keyof typeof prismaEnums.SizeType]).optional()
});
export type TGetSizeChartSchema = z.infer<typeof ZGetSizeChartSchema>;

export const ZAddSizeChartSchema = z.array(z.object({
    name: z.string(),
    value: z.string().optional(),
    type: z.enum(Object.keys(prismaEnums.SizeType) as [keyof typeof prismaEnums.SizeType]),
    parentId: z.number().optional(),
    sortOrder: z.number() 
}))
export type TAddSizeChartSchema = z.infer<typeof ZAddSizeChartSchema>;

export const ZEditSizeChartSchema = z.object({
    chartId: z.number(),
    value: z.number(),
});
export type TEditSizeChartSchema = z.infer<typeof ZEditSizeChartSchema>;

export const ZDeleteSizeChartSchema = z.object({
    id: z.number()    
});
export type TDeleteSizeChartSchema = z.infer<typeof ZDeleteSizeChartSchema>;
