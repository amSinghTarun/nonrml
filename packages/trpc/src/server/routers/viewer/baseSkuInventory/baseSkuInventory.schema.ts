import { string, z } from "zod";

export const ZGetBaseSkuInventorySchema = z.object({
    reviewId: z.number()
});
export type TGetBaseSkuInventorySchema = z.infer<typeof ZGetBaseSkuInventorySchema>;

export const ZAddBaseSkuInventorySchema = z.array(z.object({
    baseSku: z.string(),
    quantity: z.number(),
    color: z.string(),
    size: z.string(),
}));
export type TAddBaseSkuInventorySchema = z.infer<typeof ZAddBaseSkuInventorySchema>;

export const ZEditBaseSkuInventorySchema = z.object({
    baseSkuId: z.number(),
    sku: z.string().optional(),
    quantity: z.number().optional()
});
export type TEditBaseSkuInventorySchema = z.infer<typeof ZEditBaseSkuInventorySchema>;

export const ZDeleteBaseSkuInventorySchema = z.object({
    id: z.number()
});
export type TDeleteBaseSkuInventorySchema = z.infer<typeof ZDeleteBaseSkuInventorySchema>;

export const ZGetInventoryItemSchema = z.object({
    sku: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional()
});
export type TGetInventoryItemSchema = z.infer<typeof ZGetInventoryItemSchema>;