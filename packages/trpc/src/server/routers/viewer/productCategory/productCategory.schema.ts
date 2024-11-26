import { z } from "zod";

export const ZAddProductCategorySchema = z.array(z.object({
    categoryName: z.string(),
    subCategoryName: z.string(),
    displayName: z.string(),
}));
export type TAddProductCategorySchema = z.infer<typeof ZAddProductCategorySchema>;

export const ZEditProductCategorySchema = z.object({
    productCategoryId: z.number(),
    categoryName: z.string(),
    subCategoryName: z.string(),
    categorySizesId: z.number(), 
});
export type TEditProductCategorySchema = z.infer<typeof ZEditProductCategorySchema>;

export const ZDeleteProductCategorySchema = z.object({
    id: z.number()    
});
export type TDeleteProductCategorySchema = z.infer<typeof ZDeleteProductCategorySchema>;
