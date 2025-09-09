import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";
import { ShiprocketTypes } from "@nonrml/shipping"

export const ZGetUserOrderSchema = z.object({
    orderId: z.string(),   
})
export type TGetUserOrderSchema = z.infer<typeof ZGetUserOrderSchema>;

export const ZCancelAcceptedOrderSchema = z.object({
    refundMode: z.enum(["CREDIT", "BANK"]).default("CREDIT"),
    orderId: z.number(),   
})
export type TCancelAcceptedOrderSchema = z.infer<typeof ZCancelAcceptedOrderSchema>;

export const ZUpdateShipmentSchema = z.object({
    awb: z.number(),
    orderId: z.string(),
    shipmentStatus: z.string(),
})
export type TUpdateShipmentSchema = z.infer<typeof ZUpdateShipmentSchema>;

export const ZGetOrderReturnSchema = z.object({
    orderId: z.number(),   
})
export type TGetOrderReturnSchema = z.infer<typeof ZGetOrderReturnSchema>;

export const ZCancelOrderSchema = z.object({
    orderId: z.number(),   
})
export type TCancelOrderSchema = z.infer<typeof ZCancelOrderSchema>;

export const ZShipOrderrSchema = z.object({
    orderId: z.number(),
    shiprocketOrderData: ShiprocketTypes.ZOrderData
})
export type TShipOrderrSchema = z.infer<typeof ZShipOrderrSchema>;

export const ZTrackOrderSchema = z.object({
    orderId: z.string(),
    mobile: z.string().regex(/^[6-9]\d{9}$/g, "Invalid mobile number")
})
export type TTrackOrderSchema = z.infer<typeof ZTrackOrderSchema>;

export const ZVerifyOrderSchema = z.object({
    razorpayPaymentId: z.string(),
    razorpayOrderId: z.string(),
    razorpaySignature: z.string(),
})
export type TVerifyOrderSchema = z.infer<typeof ZVerifyOrderSchema>;

export const ZGetOrderAsAdminSchema = z.object({
    userEmail: z.string().includes("@").optional(),
    userMobile: z.string().length(10).optional()
});
export type TGetOrderAsAdminSchema = z.infer<typeof ZGetOrderAsAdminSchema>;

// this might have changes as per the payment serivce integrator, most probably razorpay
export const ZInitiateOrderSchema = z.object({
    orderProducts: z.record( z.object({
        variantId: z.number().min(1),
        productId: z.number().min(1),
        productSku: z.string().min(1),
        quantity: z.number().min(1),
        price: z.number().min(1),
        productName: z.string(),
        productImage: z.string(),
        size: z.string(),
    })),
    // addressId: z.number().min(1),
    creditNoteCode: z.string().optional(),
})
export type TInitiateOrderSchema = z.infer<typeof ZInitiateOrderSchema>;

export const ZEditOrderSchema = z.object({
    orderId: z.number(),
    status: z.enum(Object.keys(prismaEnums.OrderStatus) as [keyof typeof prismaEnums.OrderStatus]).optional(),
    productRejectStatus: z.record(z.string(), z.object({
        rejectedQuantity: z.number()
    })).optional(),
    returnDateExtend: z.number().optional(),
    initialReturnDate: z.number().optional()
});
export type TEditOrderSchema = z.infer<typeof ZEditOrderSchema>;

export const ZGetAllOrdersSchema = z.object({
    orderId: z.number().optional(),
    ordersDate: z.date().optional(),
    page: z.number().optional(),
    userId: z.number().optional(),
    returns: z.boolean().optional(),
    orderStatus: z.enum(Object.keys(prismaEnums.OrderStatus) as [keyof typeof prismaEnums.OrderStatus]).optional()
});
export type TGetAllOrdersSchema = z.infer<typeof ZGetAllOrdersSchema>;

export const ZGetOrderSchema = z.object({
    orderId: z.number()
});
export type TGetOrderSchema = z.infer<typeof ZGetOrderSchema>;

export const ZcancelOrderProductSchema = z.object({
    orderId: z.number(),
    productOrderId: z.number().optional()
});
export type TcancelOrderProductSchema = z.infer<typeof ZcancelOrderProductSchema>;

export const ZCheckOrderServicibilitySchema = z.object({
    // orderId: z.string()
    rzpOrderId: z.string(),
    contactNumber: z.string(),
    email: z.string(),
    addresses: z.array(z.object({
        id: z.string(),
        zipcode: z.string(),
        state_code: z.string(),
        country: z.string()
    }))
});
export type TCheckOrderServicibilitySchema = z.infer<typeof ZCheckOrderServicibilitySchema>;