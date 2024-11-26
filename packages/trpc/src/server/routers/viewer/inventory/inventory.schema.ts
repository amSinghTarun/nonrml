import { z } from "zod";

export const ZAddInventoryItemsSchema = z.array(z.object({
    productVariantId : z.number(),
    quantity: z.number(),
    baseSkuInventoryId: z.number(),
    lastRestockDate: z.date().optional(),
    lastRestockedQuantity: z.number().optional()
}));
export type TAddInventoryItemsSchema = z.infer<typeof ZAddInventoryItemsSchema>;

export const ZEditInventoryItemSchema = z.object({
    id: z.number(),
    description: z.string().optional(),
    color: z.string().optional(),
    skuPrice: z.string().optional(),
    size: z.string().optional(),
    quantity: z.number().optional(),
    productCategoryId: z.number().optional()
});
export type TEditInventoryItemSchema = z.infer<typeof ZEditInventoryItemSchema>;

export const ZDeleteInventoryItemSchema = z.object({
    id: z.number()
});
export type TDeleteInventoryItemSchema = z.infer<typeof ZDeleteInventoryItemSchema>;

export const ZGetInventoryItemSchema = z.object({
    inventoryItemId: z.number()
});
export type TGetInventoryItemSchema = z.infer<typeof ZGetInventoryItemSchema>;

export const ZGetSKUDetailsSchema = z.object({
    sku: z.string()
})
export type TGetSKUDetailsSchema = z.infer<typeof ZGetSKUDetailsSchema>;

export const ZGetInventoryItemsSchema = z.object({
    back: z.boolean(),
    lastId: z.number().optional()
});
export type TGetInventoryItemsSchema = z.infer<typeof ZGetInventoryItemsSchema>;