import { z } from "zod"

export const productImageFormSchema = z.object({
    image: z.instanceof(File, { message: "Image is required" }),
    priorityIndex: z.number(),
    active: z.boolean(),
})
  