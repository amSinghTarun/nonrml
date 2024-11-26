import { number, string, z } from "zod";

export const ZGetProductSchema = z.object({
    productId: z.number()
});
export type TGetProductSchema = z.infer<typeof ZGetProductSchema>;



export const ZAddProductVariantsSchema = z.array(z.object({
    productId: z.number(),
    subSku: z.string(),
    size: z.string(),
}))
export type TAddProductVariantsSchema = z.infer<typeof ZAddProductVariantsSchema>;

export const ZEditProductSchema = z.object({
    productId: z.number(),
    categoryId: z.number().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    skuIds: z.array(string()).optional(),
    customisable: z.boolean().optional(),
    customisationOptionProductId: z.number().optional(),
    siblingProductId: z.number().optional(),
    discountId: z.number().optional(),
    basePrice: z.number().optional(),
    finalPrice: z.number().optional(),
    avlSizeQuantity: z.object({size: string(), qunatity: number()}).optional(),
    returnAvl: z.boolean().optional(),
    tags: z.array(string())
});
export type TEditProductSchema = z.infer<typeof ZEditProductSchema>;

export const ZDeleteProductSchema = z.object({
    productId: z.number()    
});
export type TDeleteProductSchema = z.infer<typeof ZDeleteProductSchema>;
