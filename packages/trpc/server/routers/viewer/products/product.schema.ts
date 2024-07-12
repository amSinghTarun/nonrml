import { number, string, z } from "zod";

export const ZGetProductSchema = z.object({
    productId: z.number()
});
export type TGetProductSchema = z.infer<typeof ZGetProductSchema>;

export const ZGetProductsSchema = z.object({
    color: z.string().optional(),
    priceBetween: z.array(number()).length(2).optional(),
    size: z.number(),
    categoryId: z.number(),
    tags: z.array(string()), // the custom user input, like red oversize tshirt, black polo, hound design thsirt
    rating: z.number().max(5),
    back: z.boolean(),
    lastId: z.number().optional()
});
export type TGetProductsSchema = z.infer<typeof ZGetProductsSchema>;

export const ZAddProductSchema = z.object({
    categoryId: z.number(),
    name: z.string(),
    description: z.string(),
    skuIds: z.array(string()),
    customisable: z.boolean().optional(),
    customisationOptionProductId: z.number().optional(),
    siblingProductId: z.number().optional(),
    discountId: z.number().optional(),
    basePrice: z.number(),
    finalPrice: z.number(),
    avlSizeQuantity: z.object({size: string(), qunatity: number()}).optional(),
    returnAvl: z.boolean(),
    tags: z.array(string()),
    color: z.string().optional()
});
export type TAddProductSchema = z.infer<typeof ZAddProductSchema>;

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
