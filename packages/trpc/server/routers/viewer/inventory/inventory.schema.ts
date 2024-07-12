import { z } from "zod";

export const ZAddInventoryItemSchema = z.object({
    description : z.string(),
    color : z.string(),
    skuPrice : z.string(),
    size : z.string(),
    quantity : z.number(),
    productCategoryId : z.number(),
});
export type TAddInventoryItemSchema = z.infer<typeof ZAddInventoryItemSchema>;

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