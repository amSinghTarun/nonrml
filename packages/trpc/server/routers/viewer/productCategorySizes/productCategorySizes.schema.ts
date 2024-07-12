import { string, z } from "zod";

export const ZAddProductCategorySizeSchema = z.object({
    sizeAvailable: z.array(string()),
    sizeChart: z.string(),
});
export type TAddProductCategorySizeSchema = z.infer<typeof ZAddProductCategorySizeSchema>;

export const ZEditProductCategorySizeSchema = z.object({
    categorySizeId: z.number(),
    sizeAvailable: z.array(string()),
    sizeChart: z.string(),
});
export type TEditProductCategorySizeSchema = z.infer<typeof ZEditProductCategorySizeSchema>;

export const ZDeleteProductCategorySizeSchema = z.object({
    id: z.number()    
});
export type TDeleteProductCategorySizeSchema = z.infer<typeof ZDeleteProductCategorySizeSchema>;
