import { z } from "zod"

export const productImageFormSchema = z.object({
    image: z.string(),
    priorityIndex: z.number(),
    active: z.boolean(),
})
  