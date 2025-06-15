import { prisma, prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZChangePaymentStatusSchema = z.object({
    orderId: z.string(),
    paymentStatus: z.enum(Object.keys(prismaEnums.PaymentStatus) as [keyof typeof prismaEnums.PaymentStatus]),
    secret: z.string()
});
export type TChangePaymentStatusSchema = z.infer<typeof ZChangePaymentStatusSchema>;

export const ZRzpPaymentUpdateWebhookSchema = z.object({
    rzpOrderId: z.string(),
    paymentStatus: z.string(),
    refundId: z.string().optional(),
    refundStatus: z.string().optional()
});
export type TRzpPaymentUpdateWebhookSchema = z.infer<typeof ZRzpPaymentUpdateWebhookSchema>;

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
    orderId: z.number()
})
export type TInitiateUavailibiltyRefundSchema = z.infer<typeof ZInitiateUavailibiltyRefundSchema>

export const ZIssueReturnReplacementBankRefundSchema = z.object({
    replacementOrderId: z.number()
})
export type TIssueReturnReplacementBankRefundSchema = z.infer<typeof ZIssueReturnReplacementBankRefundSchema>

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