import { prisma, prismaEnums } from "@nonorml/prisma";
import { z } from "zod";

export const ZGetReplacementOrderSchema = z.object({
    replacementOrderId: z.number()
})
export type TGetReplacementOrderSchema = z.infer<typeof ZGetReplacementOrderSchema>;

export const ZInitiateReplacementOrderSchema = z.object({
    replacementReasonId: z.number(),
    replacementRequiredPhoto: z.string().optional(),
    replacementRequiredVide: z.string().optional(),
    orderProducId: z.number(),
    replacementSize: z.string(),
    quantity: z.number()
});
export type TInitiateReplacementOrderSchema = z.infer<typeof ZInitiateReplacementOrderSchema>;

export const ZChangeReplacementOrderStatusSchema = z.object({
    replacementOrderId: z.number(),
    replacementOrderStatus: z.enum([prismaEnums.ReplacementOrderStatus.ACCEPTED, prismaEnums.ReplacementOrderStatus.PICKED, prismaEnums.ReplacementOrderStatus.RECEIVED, prismaEnums.ReplacementOrderStatus.REJECTED]),
});
export type TChangeReplacementOrderStatusSchema = z.infer<typeof ZChangeReplacementOrderStatusSchema>;

export const ZCancelReplacementOrderSchema =  z.object({
    replacementOrderId : z.number()
});
export type TCancelReplacementOrderSchema = z.infer<typeof ZCancelReplacementOrderSchema>;