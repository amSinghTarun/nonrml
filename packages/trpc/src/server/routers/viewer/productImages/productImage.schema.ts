
import { z } from "zod";

export const ZAddProductImageSchema = z.array(z.object({
    image: z.string(),
    productId: z.number(),
    priorityIndex: z.number()
}));
export type TAddProductImageSchema = z.infer<typeof ZAddProductImageSchema>;

export const ZEditProductImageSchema = z.object({
    productImageId: z.number(),
    priorityIndex: z.number()
});
export type TEditProductImageSchema = z.infer<typeof ZEditProductImageSchema>;

export const ZDeleteProductImageSchema = z.object({
    productImageId: z.number()
});
export type TDeleteProductImageSchema = z.infer<typeof ZDeleteProductImageSchema>;
