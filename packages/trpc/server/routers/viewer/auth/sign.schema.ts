import { prismaEnums } from "@nonorml/prisma";
import { number, z } from "zod";

export const ZSignupSchema = z.object({
    email: z.string().email("Please type in a valid email"),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    countryCode: z.string().length(3),
    contactNumber: z.string().length(10, "The mobile should be 10 integer long"),
    dob: z.string().nullable(),
    password: z.string().min(8, "The Password must be 8 character long").max(50),
    confirmPassword: z.string().min(8, "The Password must be 8 character long").max(50),
    role: z.enum([prismaEnums.UserPermissionRole.ADMIN, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.USER]),
});
export type TSignupSchema = z.infer<typeof ZSignupSchema>;

export const ZSigninSchema = z.object({
    userIdentifier: z.string(),
    password: z.string().max(50),
});
export type TSigninSchema = z.infer<typeof ZSigninSchema>;

export const ZInitiateChangePasswordRequest = z.object({
    email: z.string().includes("@").includes(".com").optional(),
    contactNumber: z.string().max(10, "Contact number should be 10 char long").optional()
});
export type TInitiateChangePasswordRequest = z.infer<typeof ZInitiateChangePasswordRequest>;

export const ZVerifyChangePasswordOTP = z.object({
    userIdentifier: z.string(),
    otp: z.number().max(6)
});
export type TVerifyChangePasswordOTP = z.infer<typeof ZVerifyChangePasswordOTP>;

export const ZChangePassword = z.object({
    userIdentifier: z.string(),
    changeRequestType : z.enum(["OTP", "OLD_PASSWORD"]),
    newPassword: z.string().min(8, "The Password must be atleast 8 character long").max(50),
    oldPassword: z.string().min(8, "The Password must be atleast 8 character long").max(50).optional()
}).refine( (data) => {
    if(data.changeRequestType == "OLD_PASSWORD" && !data.oldPassword){
        return 
    }
}, {
    message: "The old password field can't be empty"
});
export type TChangePassword = z.infer<typeof ZChangePassword>;
