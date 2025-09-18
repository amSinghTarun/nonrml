
import { z } from "zod";

export const ZGetSignedUrlSchema = z.object({
    imageName: z.string(),
});
export type TGetSignedUrlSchema = z.infer<typeof ZGetSignedUrlSchema>;

export const ZAddProductImageSchema = z.object({
    // image: z.string(),
    // productSku: z.string(),
    productId: z.number(),
    imagePath: z.string(),
    priorityIndex: z.number(),
    active: z.boolean()
});
export type TAddProductImageSchema = z.infer<typeof ZAddProductImageSchema>;

export const ZEditProductImageSchema = z.object({
    productImageId: z.number(),
    priorityIndex: z.number().optional(),
    active: z.boolean().optional() 
});
export type TEditProductImageSchema = z.infer<typeof ZEditProductImageSchema>;

export const ZEditImagePriorityIndexImageSchema = z.record(
    z.string(), z.number()
)
export type TEditImagePriorityIndexImageSchema = z.infer<typeof ZEditImagePriorityIndexImageSchema>;

export const ZDeleteProductImageSchema = z.object({
    productImageId: z.number()
});
export type TDeleteProductImageSchema = z.infer<typeof ZDeleteProductImageSchema>;
