import { prismaEnums } from "@nonrml/prisma";
import { number, object, string, z } from "zod";

export const ZGetUserOrderSchema = z.object({
    orderId: z.string(),   
})
export type TGetUserOrderSchema = z.infer<typeof ZGetUserOrderSchema>;

export const ZCancelOrderSchema = z.object({
    orderId: z.string(),   
})
export type TCancelOrderSchema = z.infer<typeof ZCancelOrderSchema>;

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
    orderId: z.string(),
    status: z.enum(Object.keys(prismaEnums.OrderStatus) as [keyof typeof prismaEnums.OrderStatus]).optional(),
    productRejectStatus: z.record(z.string(), z.object({
        rejectedQuantity: z.number()
    })).optional(),
    returnDateExtend: z.number().optional(),
    initialReturnDate: z.number().optional()
});
export type TEditOrderSchema = z.infer<typeof ZEditOrderSchema>;

export const ZGetAllOrdersSchema = z.object({
    orderId: z.string().optional(),
    ordersDate: z.date().optional(),
    page: z.number().optional(),
    userId: z.number().optional(),
    returns: z.boolean().optional(),
    orderStatus: z.enum(Object.keys(prismaEnums.OrderStatus) as [keyof typeof prismaEnums.OrderStatus]).optional()
});
export type TGetAllOrdersSchema = z.infer<typeof ZGetAllOrdersSchema>;

export const ZGetOrderSchema = z.object({
    orderId: z.string()
});
export type TGetOrderSchema = z.infer<typeof ZGetOrderSchema>;

export const ZcancelOrderProductSchema = z.object({
    orderId: z.number(),
    productOrderId: z.number().optional()
});
export type TcancelOrderProductSchema = z.infer<typeof ZcancelOrderProductSchema>;

// export const ZOrderOutputSchema = z.object({
//     id : z.number(),
//     type : z.enum([prismaEnums.OrderType.NEW, prismaEnums.OrderType.REPLACEMENT]).nullable(),
//     finalPrice : z.string(),
//     originalOrderId : z.number().nullable(),
//     userId : z.number(),
//     productCount : z.number(),
//     addressId : z.number(),
//     discountId : z.number().nullable(),
//     countryCode : z.string(),
//     contactNumber : z.string(),
//     contactName : z.string(),
//     paymentStatus : z.enum([prismaEnums.PaymentStatus.PENDING, prismaEnums.PaymentStatus.CONFIRMED]).nullable(),
//     paymentId : z.number().nullable(),
//     shipmentId : z.number().nullable(),
//     createdAt : z.date(),
//     updatedAt : z.date(),
// });
// export type TOrderOutputSchema = z.infer<typeof ZOrderOutputSchema>;

// export const ZChangeOrderStatus = z.object({
//     status: z.enum([prismaEnums.OrderStatus.PACKING, prismaEnums.OrderStatus.SHIPPED, prismaEnums.OrderStatus.CONFIRMED, prismaEnums.OrderStatus.DELIVERED, prismaEnums.OrderStatus.PACKED]),
//     orderId: z.number()
// });
// export type TChangeOrderStatus = z.infer<typeof ZChangeOrderStatus>;