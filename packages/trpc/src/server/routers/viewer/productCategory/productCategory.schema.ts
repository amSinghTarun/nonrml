import { z } from "zod";

export const ZAddProductCategorySchema = z.object({
    categoryName: z.string(),
    parentId: z.number().optional(),
    displayName: z.string(),
});
export type TAddProductCategorySchema = z.infer<typeof ZAddProductCategorySchema>;

export const ZEditProductCategorySchema = z.object({
    productCategoryId: z.number(),
    sizeChartId: z.number(),
});
export type TEditProductCategorySchema = z.infer<typeof ZEditProductCategorySchema>;

export const ZDeleteProductCategorySchema = z.object({
    id: z.number()    
});
export type TDeleteProductCategorySchema = z.infer<typeof ZDeleteProductCategorySchema>;

export const ZGetProductCategorySchema = z.object({
    all: z.boolean().default(false)
});
export type TGetProductCategorySchema = z.infer<typeof ZGetProductCategorySchema>;
