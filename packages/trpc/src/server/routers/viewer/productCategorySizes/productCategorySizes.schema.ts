import { z } from "zod";


export const ZGetProductCategorySizeSchema = z.object({
    id: z.number(),
});
export type TGetProductCategorySizeSchema = z.infer<typeof ZGetProductCategorySizeSchema>;

export const ZAddProductCategorySizeSchema = z.object({
    sizeChartName: z.string(),
    sizeChart: z.record(z.any()),
    categoryId: z.number()
})
export type TAddProductCategorySizeSchema = z.infer<typeof ZAddProductCategorySizeSchema>;

export const ZEditProductCategorySizeSchema = z.object({
    categorySizeId: z.number(),
    sizeAvailable: z.array(z.string()),
    sizeChart: z.string(),
});
export type TEditProductCategorySizeSchema = z.infer<typeof ZEditProductCategorySizeSchema>;

export const ZDeleteProductCategorySizeSchema = z.object({
    id: z.number()    
});
export type TDeleteProductCategorySizeSchema = z.infer<typeof ZDeleteProductCategorySizeSchema>;
