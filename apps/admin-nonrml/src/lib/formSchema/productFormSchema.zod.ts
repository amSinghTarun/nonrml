import { z } from "zod"

export const productUpdateFormSchema = z.object({
    name: z.string().min(11, { message: "Must be at least 2 characters."}).optional(),
    colour: z.string().min(3, { message: "Must be at least 3 characters."}).optional(),
    description: z.string().min(20, {message: "Must be at least 20 characters."}).optional(),
    inspiration: z.string().min(20, { message: "Must be at least 20 characters."}),
    price: z.number().min(1, {message: "Must be at least 20 characters."}).optional(),
    tags: z.string().min(1, {message: "Must be at least 20 characters."}).optional(),
    categoryId: z.number().min(1, {message: "Must be at least 20 characters."}).optional(),
    care: z.string().min(2, {message: "Must be at least 20 characters."}).optional(),
    shippingDetails: z.string().min(2, { message: "Must be at least 20 characters."}),
    details: z.string().min(2, {message: "Must be at least 20 characters."}).optional()
})

export const productCreateFormSchema = z.object({
  name: z.string().min(11, { message: "Must be at least 2 characters."}),
  colour: z.string().min(3, { message: "Must be at least 3 characters."}),
  description: z.string().min(20, { message: "Must be at least 20 characters."}),
  inspiration: z.string().min(20, { message: "Must be at least 20 characters."}),
  price: z.number().min(1, { message: "Must be at least 20 characters."}),
  tags: z.string().min(1, { message: "Must be at least 20 characters."}),
  categoryId: z.number().min(1, { message: "Must be at least 20 characters."}),
  details: z.string().min(2, {message: "DMust be at least 20 characters."}),
  care: z.string().min(2, { message: "Must be at least 20 characters."}),
  shippingDetails: z.string().min(2, { message: "Must be at least 20 characters."}),
  sku: z.string().min(2, {message: "DMust be at least 20 characters."})
})