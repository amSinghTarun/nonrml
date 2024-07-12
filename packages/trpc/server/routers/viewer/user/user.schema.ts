import { z } from "zod";

export const ZEditUserPersonalInfoSchema = z.object({
    email: z.string().includes("@").includes(".com").optional(),
    contactNumber: z.string().max(10).optional(),
    password: z.string().optional(),
    firstName: z.string(),
    lastName: z.string()
});
export type TEditUserPersonalInfoSchema = z.infer<typeof ZEditUserPersonalInfoSchema>;

export const ZSendActivationLinkSchema = z.object({
    email: z.string().includes("@"),
    id: z.number()
});
export type TSendActivationLinkSchema = z.infer<typeof ZSendActivationLinkSchema>;

export const ZActivateUserAccountSchema = z.object({
    token: z.string()
});
export type TActivateUserAccountSchema = z.infer<typeof ZActivateUserAccountSchema>;