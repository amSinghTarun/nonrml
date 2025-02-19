import { prisma, prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZGetReplacementOrderSchema = z.object({
    orderId: z.string()
})
export type TGetReplacementOrderSchema = z.infer<typeof ZGetReplacementOrderSchema>;

export const ZInitiateReplacementOrderSchema = z.object({
    orderId: z.string(),
    products: z.array(z.object({
        quantity: z.number(),
        returnReason: z.string(),
        orderProductId: z.number(),
        referenceImage: z.string()
    }))
});
export type TInitiateReplacementOrderSchema = z.infer<typeof ZInitiateReplacementOrderSchema>;

export const ZInitReplacementOrderSchema =  z.object({
    replacementOrderId : z.number(),
    reviewData: z.record(z.string(), z.object({
        rejectedQuantity: z.number(),
        rejectReason: z.string()
    }))
});
export type TInitReplacementOrderSchema = z.infer<typeof ZInitReplacementOrderSchema>;

export const ZUpdateNonReplaceQuantitySchema =  z.object({
    replacementOrderProductId : z.number(),
    nonReplacementQuantity: z.number()
});
export type TUpdateNonReplaceQuantitySchema = z.infer<typeof ZUpdateNonReplaceQuantitySchema>;