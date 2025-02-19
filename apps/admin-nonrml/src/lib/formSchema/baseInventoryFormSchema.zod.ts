import { z } from "zod"

export const baseInventoryFormSchema = z.object({
    baseSku: z.string().min(5, {
      message: "name must be at least 2 characters.",
    }),
    quantity: z.number().min(0, {
      message: "Quantity can't be negative",
    }),
    size: z.string().min(1, {
      message: "Description must be at least 1 characters.",
    }),
    color: z.string().min(3, {
      message: "Description must be at least 3 characters.",
    })
});