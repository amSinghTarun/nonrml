import { z } from "zod";
import { prismaEnums } from "@nonrml/prisma";

export const ZAddDiscountSchema = z.object({
    code: z.string(),
    description: z.string(),
    discount: z.number(),
    type: z.enum([prismaEnums.DiscountType.FLAT, prismaEnums.DiscountType.PERCENTAGE]),
    expiry: z.string(),
    discountConditionId: z.number().optional(),
});
export type TAddDiscountSchema = z.infer<typeof ZAddDiscountSchema>;

export const ZEditDiscountSchema = z.object({
    id: z.number(),
    code: z.string().optional(),
    description: z.string().optional(),
    disocunt: z.number().nullable(),
    type: z.enum([prismaEnums.DiscountType.FLAT, prismaEnums.DiscountType.PERCENTAGE]).optional(),
    expiry: z.string().optional(),
    discountConditionId: z.number().optional(),
    status: z.enum([prismaEnums.DiscountStatus.ACTIVE, prismaEnums.DiscountStatus.NOT_ACTIVE])
});
export type TEditDiscountSchema = z.infer<typeof ZEditDiscountSchema>; 

export const ZDeleteDiscountSchema = z.object({
    id: z.number()
});
export type TDeleteDiscountItem = z.infer<typeof ZDeleteDiscountSchema>;

export const ZGetCreditNoteSchema = z.object({
    creditNote: z.string(),
    orderValue: z.number()
});
export type TGetCreditNoteSchema = z.infer<typeof ZGetCreditNoteSchema>;

export const ZGetCreditNoteDetailsSchema = z.object({
    creditNoteCode: z.string(),
    mobile: z.string().regex(/^[6-9]\d{9}$/g, "Invalid mobile number")
});
export type TGetCreditNoteDetailsSchema = z.infer<typeof ZGetCreditNoteDetailsSchema>;