import { z } from "zod";

export const createCategorySchema = z.object({
    categoryName: z.string()
        .min(2, { message: "Category name must be at least 2 characters." })
        .max(50, { message: "Category name must not exceed 50 characters." }),
    displayName: z.string()
        .min(2, { message: "Display name must be at least 2 characters." })
        .max(50, { message: "Display name must not exceed 50 characters." }),
    parentId: z.number().optional(),
});