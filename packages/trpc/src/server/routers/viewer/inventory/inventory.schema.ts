import { z } from "zod";

export const ZAddInventoryItemsSchema = z.array(z.object({
    productVariantId : z.number(),
    quantity: z.number().default(0),
    baseSkuInventoryId: z.number().optional()
}));
export type TAddInventoryItemsSchema = z.infer<typeof ZAddInventoryItemsSchema>;

export const ZEditInventoryItemSchema = z.object({
    id: z.number(),
    quantity: z.number().optional(),
    productSize: z.string().optional(),
    baseSkuId: z.number().optional()
});
export type TEditInventoryItemSchema = z.infer<typeof ZEditInventoryItemSchema>;

export const ZDeleteInventoryItemSchema = z.object({
    id: z.number(),
    unlink: z.boolean().optional()
});
export type TDeleteInventoryItemSchema = z.infer<typeof ZDeleteInventoryItemSchema>;

export const ZGetInventoryItemSchema = z.object({
    sku: z.string().optional()
});
export type TGetInventoryItemSchema = z.infer<typeof ZGetInventoryItemSchema>;

export const ZGetSKUDetailsSchema = z.object({
    sku: z.string().optional()
})
export type TGetSKUDetailsSchema = z.infer<typeof ZGetSKUDetailsSchema>;

export const ZGetInventoryItemsSchema = z.object({ });
export type TGetInventoryItemsSchema = z.infer<typeof ZGetInventoryItemsSchema>;