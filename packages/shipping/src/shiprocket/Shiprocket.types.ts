import { z } from "zod";

export const ZShiprocketAddress = z.object({
  customerName: z.string(),
  address: z.string(),
  city: z.string(),
  pincode: z.string(),
  state: z.string(),
  country: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  lastName: z.string().optional(),
  address2: z.string().optional(),
  alternatePhone: z.string().optional(),
  isdCode: z.string().optional(),
});

export const ZShiprocketOrderItem = z.object({
  name: z.string(),
  sku: z.string(),
  units: z.number().int().positive(),
  sellingPrice: z.number(),
  discount: z.union([z.number(), z.string()]).optional(),
  tax: z.union([z.number(), z.string()]).optional(),
  hsn: z.string().optional(),
});

export const ZShiprocketDimensions = z.object({
  length: z.number(),
  breadth: z.number(),
  height: z.number(),
});

export const ZShiprocketOrderData = z.object({
  orderId: z.string(), // or z.number() if that’s your type
  orderDate: z.string(), // ISO datetime string
  pickupLocation: z.string(),
  billing: ZShiprocketAddress,
  shippingIsBilling: z.boolean(),
  shipping: ZShiprocketAddress.optional(), // required if !shippingIsBilling
  orderItems: z.array(ZShiprocketOrderItem).min(1),
  paymentMethod: z.string(),
  subTotal: z.number(),
  dimensions: ZShiprocketDimensions,
  weight: z.number(),

  // optional fields
  channelId: z.number().optional(),
  comment: z.string().optional(),
  resellerName: z.string().optional(),
  companyName: z.string().optional(),
  shippingCharges: z.number().optional(),
  giftwrapCharges: z.number().optional(),
  transactionCharges: z.number().optional(),
  totalDiscount: z.number().optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  ewaybillNo: z.string().optional(),
  customerGstin: z.string().optional(),
  invoiceNumber: z.string().optional(),
  orderType: z.string().optional(),
  checkoutShippingMethod: z.string().optional(),
  what3wordsAddress: z.string().optional(),
  isInsuranceOpt: z.boolean().optional(),
  isDocument: z.boolean().optional(),
  orderTag: z.string().optional(),
});