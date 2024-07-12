import { Schema, string, z } from "zod";

export const ZGetReviewsSchema = z.object({
    productId: z.number(),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    rating: z.number().optional()
});
export type TGetReviewsSchema = z.infer<typeof ZGetReviewsSchema>;

export const ZGetReviewSchema = z.object({
    reviewId: z.number()
});
export type TGetReviewSchema = z.infer<typeof ZGetReviewSchema>;

export const ZAddReviewsSchema = z.object({
    productId: z.number(),
    rating: z.number().max(5, "Rating should be in range 0 - 5").min(0, "Rating should be in range 0 - 5"),
    review: z.string().length(150, "Review should be under 100 words").optional(),
    reviewImages: z.array(string()).optional()
});
export type TAddReviewSchema = z.infer<typeof ZAddReviewsSchema>;

export const ZEditReviewsSchema = z.object({
    reviewId: z.number(),
    rating: z.number().max(5, "Rating should be in range 0 - 5").min(0, "Rating should be in range 0 - 5").optional(),
    review: z.string().length(150, "Review should be under 100 words").optional(),
    reviewImages: z.array(string()).optional()
});
export type TEditReviewSchema = z.infer<typeof ZEditReviewsSchema>;

export const ZDeleteReviewsSchema = z.object({
    reviewId: z.number()
});
export type TDeleteReviewSchema = z.infer<typeof ZDeleteReviewsSchema>;
