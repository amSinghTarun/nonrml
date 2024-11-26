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
    lastRestockDate: z.date().optional(),
    lastRestockedQuantity: z.number().optional()
}));
export type TAddBaseSkuInventorySchema = z.infer<typeof ZAddBaseSkuInventorySchema>;

export const ZEditBaseSkuInventorySchema = z.object({
    reviewId: z.number(),
    rating: z.number().max(5, "Rating should be in range 0 - 5").min(0, "Rating should be in range 0 - 5").optional(),
    review: z.string().length(150, "Review should be under 100 words").optional(),
    reviewImages: z.array(string()).optional()
});
export type TEditBaseSkuInventorySchema = z.infer<typeof ZEditBaseSkuInventorySchema>;

export const ZDeleteBaseSkuInventorySchema = z.object({
    reviewId: z.number()
});
export type TDeleteBaseSkuInventorySchema = z.infer<typeof ZDeleteBaseSkuInventorySchema>;