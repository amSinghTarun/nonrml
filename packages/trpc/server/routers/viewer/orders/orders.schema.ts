import { prismaEnums } from "@nonorml/prisma";
import { number, object, string, z } from "zod";

export const ZGetUserOrderSchema = z.object({
    orderId: z.number()
})
export type TGetUserOrderSchema = z.infer<typeof ZGetUserOrderSchema>;

export const ZGetOrderAsAdminSchema = z.object({
    userEmail: z.string().includes("@").optional(),
    userMobile: z.string().length(10).optional()
});
export type TGetOrderAsAdminSchema = z.infer<typeof ZGetOrderAsAdminSchema>;

// this might have changes as per the payment serivce integrator, most probably razorpay
export const ZInitiateOrderSchema = z.object({
    addressId: z.number().optional(),
    type: z.enum([prismaEnums.OrderType.NEW, prismaEnums.OrderType.REPLACEMENT]).default(prismaEnums.OrderType.NEW),
    address: z.object({
        contactName: z.string(),
        countryCode: z.string().length(3),
        contactNumber: z.string().length(10),
        location: z.string(),
        landmark: z.string().nullable(),
        pincode: z.string().length(6),
        city: z.string(),
        state: z.string(),
    }).optional(),
    directOrder: z.boolean().optional(),
    productDetails: z.object({
        sku: z.string(),
        quantity: z.number()
    }).optional(),
    discountId: z.number().optional(),
    paymentId: z.number(),
    originalOrderId: z.number().optional()
}).refine( ( data ) => {
    if(data.directOrder && data.productDetails)
        return;
}, {
    message: "Invalid input in product details"
});
export type TInitiateOrderSchema = z.infer<typeof ZInitiateOrderSchema>;

export const ZEditOrderSchema = z.object({
    orderId: z.number(),
    paymentStatus: z.enum([prismaEnums.PaymentStatus.PENDING, prismaEnums.PaymentStatus.CONFIRMED])
});
export type TEditOrderSchema = z.infer<typeof ZEditOrderSchema>;

export const ZcancelOrderProductSchema = z.object({
    orderId: z.number(),
    productOrderId: z.number().optional()
});
export type TcancelOrderProductSchema = z.infer<typeof ZcancelOrderProductSchema>;

export const ZOrderOutputSchema = z.object({
    id : z.number(),
    type : z.enum([prismaEnums.OrderType.NEW, prismaEnums.OrderType.REPLACEMENT]).nullable(),
    finalPrice : z.string(),
    originalOrderId : z.number().nullable(),
    userId : z.number(),
    productCount : z.number(),
    addressId : z.number(),
    discountId : z.number().nullable(),
    countryCode : z.string(),
    contactNumber : z.string(),
    contactName : z.string(),
    paymentStatus : z.enum([prismaEnums.PaymentStatus.PENDING, prismaEnums.PaymentStatus.CONFIRMED]).nullable(),
    paymentId : z.number().nullable(),
    shipmentId : z.number().nullable(),
    createdAt : z.date(),
    updatedAt : z.date(),
});
export type TOrderOutputSchema = z.infer<typeof ZOrderOutputSchema>;

export const ZChangeOrderStatus = z.object({
    status: z.enum([prismaEnums.OrderStatus.PACKING, prismaEnums.OrderStatus.SHIPPED, prismaEnums.OrderStatus.CONFIRMED, prismaEnums.OrderStatus.DELIVERED, prismaEnums.OrderStatus.PACKED]),
    orderId: z.number()
});
export type TChangeOrderStatus = z.infer<typeof ZChangeOrderStatus>;
