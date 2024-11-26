import { prisma, prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZGetReplacementOrderSchema = z.object({
    orderId: z.number()
})
export type TGetReplacementOrderSchema = z.infer<typeof ZGetReplacementOrderSchema>;

export const ZInitiateReplacementOrderSchema = z.object({
    orderId: z.number(),
    products: z.array(z.object({
        quantity: z.number(),
        returnReason: z.string(),
        orderProductId: z.number(),
        referenceImage: z.string()
    }))
});
export type TInitiateReplacementOrderSchema = z.infer<typeof ZInitiateReplacementOrderSchema>;

// export const ZChangeReplacementOrderStatusSchema = z.object({
//     replacementOrderId: z.number(),
//     replacementOrderStatus: z.enum([prismaEnums.ReplacementOrderStatus.ACCEPTED, prismaEnums.ReplacementOrderStatus.PICKED, prismaEnums.ReplacementOrderStatus.RECEIVED, prismaEnums.ReplacementOrderStatus.REJECTED]),
// });
// export type TChangeReplacementOrderStatusSchema = z.infer<typeof ZChangeReplacementOrderStatusSchema>;

// export const ZCancelReplacementOrderSchema =  z.object({
//     replacementOrderId : z.number()
// });
// export type TCancelReplacementOrderSchema = z.infer<typeof ZCancelReplacementOrderSchema>;