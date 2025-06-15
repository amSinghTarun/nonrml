import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZInitiateReturnSchema = z.object({
    orderId: z.number(),
    returnReason: z.string().optional(),
    referenceImages: z.array(z.string()).optional(),
    products: z.array(z.object({
        quantity: z.number(),
        orderProductId: z.number(),
        exchangeVariant: z.number().optional()
    })),
    returnType: z.enum(Object.keys(prismaEnums.ReturnType) as [keyof typeof prismaEnums.ReturnType]).default("RETURN")
});
export type TInitiateReturnSchema = z.infer<typeof ZInitiateReturnSchema>;

export const ZGetReturnOrdersSchema = z.object({
    orderId: z.number(),
});
export type TGetReturnOrdersSchema = z.infer<typeof ZGetReturnOrdersSchema>;

export const ZEditReturnSchema  = z.object({
    returnId: z.number(),
    returnStatus: z.enum(Object.keys(prismaEnums.ReturnStatus) as [keyof typeof prismaEnums.ReturnStatus]),
    reviewData: z.record(z.string(), z.object({
        rejectedQuantity: z.number(),
        rejectReason: z.string()
    })).optional()
});
export type TEditReturnSchema = z.infer<typeof ZEditReturnSchema>;

export const ZCancelReturnOrderSchema =  z.object({
    returnOrderId : z.number()
});
export type TCancelReturnOrderSchema = z.infer<typeof ZCancelReturnOrderSchema>;

export const ZFinaliseReturnOrderStatus = z.object({
    returnOrderId: z.number(),
    productIds: z.array(z.number()),
    orderId : z.number(),
});
export type TFinaliseReturnOrderSchema = z.infer<typeof ZFinaliseReturnOrderStatus>;