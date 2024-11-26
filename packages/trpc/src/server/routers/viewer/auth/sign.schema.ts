import { z } from "zod";

export const ZSendOTPSchema = z.object({
    contactNumber: z.string().regex(/^[6-9]\d{9}$/g).length(10)
}).strict()
export type TSendOTPSchema = z.infer<typeof ZSendOTPSchema>

export const ZVerifyOTPSchema = z.object({
    contactNumber: z.string().regex(/^[6-9]\d{9}$/g).length(10),
    otp: z.number().gte(100000, "Invalid OTP").lte(999999, "OTP at max can be 6 digits")
}).strict()
export type TVerifyOTPSchema = z.infer<typeof ZVerifyOTPSchema>