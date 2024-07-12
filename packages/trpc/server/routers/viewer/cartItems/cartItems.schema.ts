import { z } from "zod";

export const ZAddCartItemSchema = z.object({
    productSKU: z.string(),
});
export type TAddCartItemSchema = z.infer<typeof ZAddCartItemSchema>;

export const ZEditCartItemSchema = z.object({
    cartItemId: z.number(), 
    quantity: z.number().min(-1).max(1),
    size: z.string()
});
export type TEditCartItemSchema = z.infer<typeof ZEditCartItemSchema>;

export const ZDeleteCartItemSchema = z.object({
    cartItemId: z.number()
});
export type TDeleteCartItemSchema = z.infer<typeof ZDeleteCartItemSchema>;
