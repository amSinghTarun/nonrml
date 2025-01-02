import { prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import { number, string, z } from "zod";

export const ZGetProductSchema = z.object({
    productSku: z.string()
});
export type TGetProductSchema = z.infer<typeof ZGetProductSchema>;

export const ZGetProductsSizes = z.array(z.number()).min(1);
export type TGetProductsSizes = z.infer<typeof ZGetProductsSizes>;

export const ZGetHomeProductsSchema = z.object({
    latest: z.boolean(),
    exclusive: z.boolean(),
    popular: z.boolean()
});
export type TGetHomeProductsSchema = z.infer<typeof ZGetHomeProductsSchema>;

export const ZGetProductsSchema = z.object({
    size: z.number().optional(),
    availability: z.boolean().optional(),
    categoryName: z.string().optional(),
    sortBy: z.enum(["visitedCount", "price"]).optional(),
    take: z.number().optional(),
    tags: z.array(string()).optional(), // the custom user input, like red oversize tshirt, black polo, hound design thsirt
    back: z.boolean().optional(),
    cursor: z.number().optional(),
});
export type TGetProductsSchema = z.infer<typeof ZGetProductsSchema>;

export const ZAddProductSchema = z.array(z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    categoryId : z.number(),
    tags: z.array(z.string()),
    sku: z.string(),
    care: z.array(z.string()),
    details: z.array(z.string())
}));
export type TAddProductSchema = z.infer<typeof ZAddProductSchema>;

export const ZGetProductVariantQuantitySchema = z.object({
    productId: z.number()
})
export type TGetProductVariantQuantitySchema = z.infer<typeof ZGetProductVariantQuantitySchema>;

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

export const ZVerifyCheckoutProductsSchema = z.object({
    orderProducts: z.record( z.object({
        variantId: z.number().min(1),
        productId: z.number().min(1),
        quantity: z.number().min(1),
        price: z.number().min(1),
        productName: z.string(),
        productImage: z.string(),
        size: z.string(),
    })),
    addressId: z.number().min(1),
    creditNoteCode: z.string().optional(),
})
export type TVerifyCheckoutProductsSchema = z.infer<typeof ZVerifyCheckoutProductsSchema>;