import { string, z } from "zod";

export const ZPlaceVendorOrder = z.object({
    vendorName: z.string(),
    vendorAddress: z.string(),
    totalPrice: z.string(),
    advPayment: z.string(),
    advPaymentMode: z.string(),
    advPaymentDate: z.date(),
    advPaymentTransactionId: z.string(),
    orderDate: z.date(),
})
export type TPlaceVendorOrder = z.infer<typeof ZPlaceVendorOrder>;

export const ZPlaceVendorOrderOutputSchema = z.object({
    id : z.number(),
    vendorName : z.string(),
    vendorAddress : z.string(),
    totalPrice : z.string(),
    advPayment : z.string(),
    advPaymentMode : z.string(),
    advPaymentDate : z.date(),
    advPaymentTransactionId : z.string(),
    finalPayment : z.string().nullable(),
    finalPaymentMode : z.string().nullable(),
    finalPaymentDate : z.date().nullable(),
    finalPaymentTransactionId : z.string().nullable(),
    orderDate : z.date(),
    receivingDate : z.date().nullable(),
    orderDetails : z.array(z.string()), // ["tshirt:black:M:40", "tshirt:red:L:15"]  
    createdAt : z.date(),
    updatedAt : z.date()
});
export type TPlaceVendorOrderOutputSchema = z.infer<typeof ZPlaceVendorOrderOutputSchema>;

export const ZUpdateVendorOrder = z.object({
    id: z.number(),
    vendorName: z.string().optional(),
    vendorAddress: z.string().optional(),
    totalPrice: z.string().optional(),
    advPayment: z.string().optional(),
    advPaymentMode: z.string().optional(),
    advPaymentDate: z.date().optional(),
    advPaymentTransactionId: z.string().optional(),
    orderDate: z.date().optional(),
    finalPayment: z.string().nullable(),
    finalPaymentMode: z.string().nullable(),
    finalPaymentDate: z.string().nullable(),
    finalPaymentTransactionId: z.string().nullable(),
});
export type TUpdateVendorOrder = z.infer<typeof ZUpdateVendorOrder>;

export const ZUpdateVendorOrderOutputSchema = z.object({
    id : z.number(),
    vendorName : z.string(),
    vendorAddress : z.string(),
    totalPrice : z.string(),
    advPayment : z.string(),
    advPaymentMode : z.string(),
    advPaymentDate : z.date(),
    advPaymentTransactionId : z.string(),
    finalPayment : z.string().nullable(),
    finalPaymentMode : z.string().nullable(),
    finalPaymentDate : z.date().nullable(),
    finalPaymentTransactionId : z.string().nullable(),
    orderDate : z.date(),
    receivingDate : z.date().nullable(),
    orderDetails : z.array(z.string()), // ["tshirt:black:M:40", "tshirt:red:L:15"]  
    createdAt : z.date(),
    updatedAt : z.date()
});
export type TUpdateVendorOrderOutputSchema = z.infer<typeof ZUpdateVendorOrderOutputSchema>

export const ZDeleteVendorOrder = z.object({
    id: z.number()
})
export type TDeleteVendorOrder = z.infer<typeof ZDeleteVendorOrder>;
