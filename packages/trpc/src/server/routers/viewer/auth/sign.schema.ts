import { z } from "zod";

export const ZSendOTPSchema = z.object({
    contactNumber: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format").length(13, "Invalid contact number")  
}).strict()
export type TSendOTPSchema = z.infer<typeof ZSendOTPSchema>

export const ZVerifyOTPSchema = z.object({
    contactNumber: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid Indian mobile number format").length(13),
    otp: z.number().gte(100000, "Invalid OTP").lte(999999, "OTP at max can be 6 digits")
}).strict()
export type TVerifyOTPSchema = z.infer<typeof ZVerifyOTPSchema>