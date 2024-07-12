import { z } from "zod";
import { prismaEnums } from "@nonorml/prisma";

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

export const ZApplyDiscountSchema = z.object({
    discountId: z.number(),
    cartId: z.number(),
    userId: z.number()
});
export type TApplyDiscountSchema = z.infer<typeof ZApplyDiscountSchema>;

export const ZGetDiscountsSchema = z.object({
    status: z.enum([prismaEnums.DiscountStatus.ACTIVE, prismaEnums.DiscountStatus.NOT_ACTIVE]).default(prismaEnums.DiscountStatus.ACTIVE),
    expiry: z.string().default(`${Date.now()}`)
});
export type TGetDiscountsSchema = z.infer<typeof ZGetDiscountsSchema>;