import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZInitiateReturnSchema = z.object({
    orderId: z.number(),
    products: z.array(z.object({
        quantity: z.number(),
        returnReason: z.string(),
        orderProductId: z.number(),
        referenceImage: z.string(),
        exchangeVariant: z.number().optional()
    })),
    returnType: z.enum(["RETURN","REPLACEMENT"]).default("RETURN")
});
export type TInitiateReturnSchema = z.infer<typeof ZInitiateReturnSchema>;

export const ZGetReturnOrdersSchema = z.object({
    orderId: z.number(),
});
export type TGetReturnOrdersSchema = z.infer<typeof ZGetReturnOrdersSchema>;

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