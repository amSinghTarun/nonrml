import { z } from "zod";

export const ZAddWishlistItemsSchema = z.object({
    userId: z.number(),
    productId: z.number(),
});
export type TAddWishlistItemsSchema = z.infer<typeof ZAddWishlistItemsSchema>;

export const ZEditWishlistItemsSchema = z.object({
    wishlistItemsId: z.number(), 
    quantity: z.number()
});
export type TEditWishlistItemsSchema = z.infer<typeof ZEditWishlistItemsSchema>;

export const ZDeleteWishlistItemsSchema = z.object({
    wishlistItemsId: z.number()
});
export type TDeleteWishlistItemsSchema = z.infer<typeof ZDeleteWishlistItemsSchema>;

export const ZAddWishlistItemsOutputSchema = z.object({

});