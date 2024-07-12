import { prismaEnums } from "@nonorml/prisma";
import { z } from "zod";

export const ZInitiateReturnSchema = z.object({
    returnReason: z.string(),
    orderId: z.number(),
    productIds: z.array(z.number())
});
export type TInitiateReturnSchema = z.infer<typeof ZInitiateReturnSchema>;

export const ZEditReturnSchema = z.object({
    returnId: z.number(),
    status: z.enum([prismaEnums.ReturnStatus.PENDING, prismaEnums.ReturnStatus.ACCEPTED, prismaEnums.ReturnStatus.REJECTED]).optional(),
    returnReceivedDate: z.date().optional(),
    paymentId: z.number().optional()
});
export type TEditReturnSchema = z.infer<typeof ZEditReturnSchema>;

export const ZDeleteReturnSchema  = z.object({
    returnId: z.number()
});
export type TDeleteReturnSchema = z.infer<typeof ZDeleteReturnSchema>;

export const ZCancelReturnOrderSchema =  z.object({
    returnOrderId : z.number()
});
export type TCancelReturnOrderSchema = z.infer<typeof ZCancelReturnOrderSchema>;

export const ZFinaliseReturnOrderStatus = z.object({
    returnOrderId: z.number(),
    productIds: z.array(z.number()),
    orderId : z.number(),
    status: z.enum([prismaEnums.ProductStatus.RETURN_ACCEPTED, prismaEnums.ProductStatus.RETURN_REJECTED])
});
export type TFinaliseReturnOrderSchema = z.infer<typeof ZFinaliseReturnOrderStatus>;