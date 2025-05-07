import { prisma, prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZCreateRzpOrderSchema = z.object({
    orderTotal:z.number(),
    addressId: z.number().optional()
});
export type TCreateRzpOrderSchema = z.infer<typeof ZCreateRzpOrderSchema>;

export const ZChangePaymentStatusSchema = z.object({
    orderId: z.string(),
    paymentStatus: z.enum(["failed", "paid"])
});
export type TChangePaymentStatusSchema = z.infer<typeof ZChangePaymentStatusSchema>;

export const ZEditPermissionSchema = z.object({
    permissionId: z.number(),
    permissionName: z.string().optional(),
    active: z.boolean()
});
export type TEditPermissionSchema = z.infer<typeof ZEditPermissionSchema>;

// can't delete permission if it's being used
export const ZDeletePermissionSchema = z.object({
    permissionId: z.number()
});
export type TDeletePermissionSchema = z.infer<typeof ZDeletePermissionSchema>;

export const ZInitiateUavailibiltyRefundSchema = z.object({
    orderId: z.string()
})
export type TInitiateUavailibiltyRefundSchema = z.infer<typeof ZInitiateUavailibiltyRefundSchema>

export const ZGetPaymentsSchema = z.object({ 
    search: z.string().optional(),
    paymentStatus: z.enum(Object.keys(prismaEnums.PaymentStatus) as [keyof typeof prismaEnums.PaymentStatus]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    page: z.number().optional()
})
export type TGetPaymentsSchema = z.infer<typeof ZGetPaymentsSchema>

export const ZGetPaymentRefundDetailsSchema = z.object({ 
    rzpPaymentId: z.string().optional()
})
export type TGetPaymentRefundDetailsSchema = z.infer<typeof ZGetPaymentRefundDetailsSchema>