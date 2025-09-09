// packages/shipping/src/type.ts - Complete and fixed file

import { z } from "zod";

export interface ShiprocketConfig {
  apiToken: string;
  isProduction?: boolean;
  baseUrl?: string;
  timeout?: number;
}

export interface Address {
  customerName: string;
  lastName?: string;
  address: string;
  address2?: string;
  city: string;
  pincode: number;
  state: string;
  country: string;
  email: string;
  phone: number;
  alternatePhone?: number;
  isdCode?: string;
}

export interface OrderItem {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  discount?: number | string;
  tax?: number | string;
  hsn?: number | string;
}

export interface Dimensions {
  length: number;
  breadth: number;
  height: number;
}

export interface ServiceabilityParams {
  pickupPostcode: number;
  deliveryPostcode: number;
  orderId?: number;
  cod?: boolean; // true for COD, false for Prepaid
  weight?: string;
  length?: number;
  breadth?: number;
  height?: number;
  declaredValue?: number;
  mode?: 'Surface' | 'Air';
  isReturn?: boolean;
  couriersType?: number; // 1 to filter documents couriers
  onlyLocal?: number; // 1 to filter hyperlocal couriers only
  qcCheck?: number; // QC-enabled couriers filter
}

export interface CourierCompany {
  id: number;
  name: string;
  city: string;
  is_surface: boolean;
  is_air: boolean;
  is_reverse: boolean;
  is_cod: boolean;
  is_prepaid: boolean;
  is_instant: boolean;
  is_same_day: boolean;
  is_next_day: boolean;
  is_international: boolean;
  is_hyperlocal: boolean;
  delivery_performance: string;
  base_weight: number;
  weight_cases: any[];
  zones: any[];
  local_region: number;
  metro_region: number;
  rest_of_india: number;
  special_zone: number;
  within_city: number;
  others: number;
  pickup_performance: number;
  courier_type: string;
  delivery_boy_contact: string;
  pickup_supress_hours: number;
  suppress_text: string;
  suppress_date: string;
  est_delivery_days: string;
  rating: number;
  freight_charge: number;
  cod_charges: number;
  cod_multiplier: number;
  cost: number;
  other_charges: number;
  fuel_surcharge: number;
  rto_charges: number;
  qc_courier: boolean;
  secure_shipment_disabled: boolean;
  coverage_charges: number;
  volumetric_weight: number;
  rank: number;
  eta: string;
  etd: string;
  call_before_delivery: string;
  ship_type: number;
  charge_weight: number;
}

export interface ServiceabilityResponse {
  success: boolean;
  couriers: CourierCompany[];
  pickupPostcode: number;
  deliveryPostcode: number;
  message?: string;
  error?: string;
  details?: any;
}

export interface OrderData {
  orderId: string;
  orderDate: string; // Format: "YYYY-MM-DD HH:MM"
  pickupLocation: string;
  channelId?: number;
  comment?: string;
  resellerName?: string;
  companyName?: string;
  billing: Address;
  shippingIsBilling: boolean;
  shipping?: Address; // Required if shippingIsBilling is false
  orderItems: OrderItem[];
  paymentMethod: 'COD' | 'Prepaid';
  shippingCharges?: number;
  giftwrapCharges?: number;
  transactionCharges?: number;
  totalDiscount?: number;
  subTotal: number;
  dimensions: Dimensions;
  weight: number;
  longitude?: number;
  latitude?: number;
  ewaybillNo?: string;
  customerGstin?: string;
  invoiceNumber?: string;
  orderType?: 'ESSENTIALS' | 'NON ESSENTIALS';
  checkoutShippingMethod?: 'SR_RUSH' | 'SR_STANDARD' | 'SR_EXPRESS' | 'SR_QUICK';
  what3wordsAddress?: string;
  isInsuranceOpt?: boolean;
  isDocument?: number; // 1 or 0
  orderTag?: string;
}

export const ZAddress = z.object({
  customerName: z.string(),
  lastName: z.string().optional(),
  address: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  pincode: z.number(),
  state: z.string(),
  country: z.string(),
  email: z.string().email(),
  phone: z.number(),
  alternatePhone: z.number().optional(),
  isdCode: z.string().optional(),
});

export const ZOrderItem = z.object({
  name: z.string(),
  sku: z.string(),
  units: z.number().int().positive(),
  sellingPrice: z.number(),
  discount: z.union([z.number(), z.string()]).optional(),
  tax: z.union([z.number(), z.string()]).optional(),
  hsn: z.union([z.number(), z.string()]).optional(),
});

// Dimensions
export const ZDimensions = z.object({
  length: z.number(),
  breadth: z.number(),
  height: z.number(),
});

export const ZOrderData = z.object({
  orderId: z.string(),
  orderDate: z.string(), // "YYYY-MM-DD HH:MM"
  pickupLocation: z.string(),
  channelId: z.number().optional(),
  comment: z.string().optional(),
  resellerName: z.string().optional(),
  companyName: z.string().optional(),
  billing: ZAddress,
  shippingIsBilling: z.boolean(),
  shipping: ZAddress.optional(),
  orderItems: z.array(ZOrderItem).min(1),
  paymentMethod: z.enum(["COD", "Prepaid"]),
  shippingCharges: z.number().optional(),
  giftwrapCharges: z.number().optional(),
  transactionCharges: z.number().optional(),
  totalDiscount: z.number().optional(),
  subTotal: z.number(),
  dimensions: ZDimensions,
  weight: z.number(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  ewaybillNo: z.string().optional(),
  customerGstin: z.string().optional(),
  invoiceNumber: z.string().optional(),
  orderType: z.enum(["ESSENTIALS", "NON ESSENTIALS"]).optional(),
  checkoutShippingMethod: z
    .enum(["SR_RUSH", "SR_STANDARD", "SR_EXPRESS", "SR_QUICK"])
    .optional(),
  what3wordsAddress: z.string().optional(),
  isInsuranceOpt: z.boolean().optional(),
  isDocument: z.number().optional(),
  orderTag: z.string().optional(),
});

export interface OrderResponse {
  orderId: string;
  shipmentId: string;
  channelOrderId: string;
  status: string;
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

// Return Order Interfaces
export interface ReturnOrderResponse {
  orderId: string;
  shipmentId: string;
  channelOrderId: string;
  status: string;
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
}

// Flat payload exactly as Shiprocket Return Order API expects
export interface ShiprocketReturnOrderPayload {
  // Top-level required
  order_id: string;              // <= 50 chars
  order_date: string;            // yyyy-mm-dd (time optional)
  payment_method: 'Prepaid';
  sub_total: number;
  length: number;                // cm
  breadth: number;               // cm
  height: number;                // cm
  weight: number;                // kg

  // Optional top-level
  channel_id?: number;
  total_discount?: number;

  // Pickup (customer) – all required per docs
  pickup_customer_name: string;
  pickup_last_name?: string;
  pickup_address: string;
  pickup_address_2?: string;
  pickup_city: string;
  pickup_state: string;
  pickup_country: string;
  pickup_pincode: number;
  pickup_email: string;          // required by Shiprocket
  pickup_phone: string;          // string to preserve leading 0s
  pickup_isd_code?: string;

  // Shipping (your warehouse) – all required except last_name/address_2/email/isd_code
  shipping_customer_name: string;
  shipping_last_name?: string;
  shipping_address: string;
  shipping_address_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_pincode: number;
  shipping_phone: string;
  shipping_email?: string;
  shipping_isd_code?: string;

  // Items
  order_items: ShiprocketReturnOrderItem[];
}

// Per-item payload
export interface ShiprocketReturnOrderItem {
  // Required
  name: string;
  sku: string;
  units: number;
  selling_price: number;

  // Optional
  discount?: number;
  hsn?: string;
  return_reason?: string;

  // QC – conditional if qc_enable === "true"
  qc_enable?: true | false;
  qc_color?: string;
  qc_brand?: string;
  qc_serial_no?: string;
  qc_ean_barcode?: string;
  qc_size?: string;
  qc_product_name?: string;      // REQUIRED if qc_enable = "true"
  qc_product_image?: string;     // REQUIRED if qc_enable = "true" (png/jpg URL)
  qc_product_imei?: string;
  qc_brand_tag?: 0 | 1;
  qc_used_check?: 0 | 1;
  qc_sealtag_check?: 0 | 1;
  qc_check_damaged_product?: 'yes' | 'no';
}

// Example usage interface for better developer experience
export interface CreateOrderExample {
  orderId: string; // "224-447"
  orderDate: string; // "2019-07-24 11:11"
  pickupLocation: string; // "Jammu"
  comment?: string; // "Reseller: M/s Goku"
  billing: {
    customerName: string; // "Naruto"
    lastName?: string; // "Uzumaki"
    address: string; // "House 221B, Leaf Village"
    address2?: string; // "Near Hokage House"
    city: string; // "New Delhi"
    pincode: number; // 110002
    state: string; // "Delhi"
    country: string; // "India"
    email: string; // "naruto@uzumaki.com"
    phone: number; // 9876543210
  };
  shippingIsBilling: boolean; // true
  orderItems: Array<{
    name: string; // "Kunai"
    sku: string; // "chakra123"
    units: number; // 10
    sellingPrice: number; // 900
    discount?: number | string; // ""
    tax?: number | string; // ""
    hsn?: number; // 441122
  }>;
  paymentMethod: 'Prepaid' | 'COD'; // "Prepaid"
  shippingCharges?: number; // 0
  giftwrapCharges?: number; // 0
  transactionCharges?: number; // 0
  totalDiscount?: number; // 0
  subTotal: number; // 9000
  dimensions: {
    length: number; // 10
    breadth: number; // 15
    height: number; // 20
  };
  weight: number; // 2.5
}

export interface CreateReturnOrderExample {
  orderId: string; // "RET-224-447"
  orderDate: string; // "2019-08-05"
  channelId?: number; // 768903
  pickup: {
    customerName: string; // "John"
    lastName?: string; // "Doe"
    address: string; // "416, Udyog Vihar III, Sector 20"
    address2?: string; // "DDA"
    city: string; // "Delhi"
    state: string; // "New Delhi"
    country: string; // "India"
    pincode: number; // 110002
    email: string; // "john@doe.com"
    phone: string; // "9999999999"
    isdCode?: string; // "91"
  };
  shipping: {
    customerName: string; // "Jane"
    lastName?: string; // "Doe"
    address: string; // "Castle"
    address2?: string; // "Bridge"
    city: string; // "Mumbai"
    state: string; // "Maharashtra"
    country: string; // "India"
    pincode: number; // 220022
    email?: string; // "jane@doe.com"
    phone: string; // "8888888888"
    isdCode?: string; // "91"
  };
  orderItems: Array<{
    name: string; // "ball123"
    sku: string; // "Tennis Ball"
    units: number; // 1
    sellingPrice: number; // 10
    discount?: number; // 0
    hsn?: string; // "4412"
    returnReason?: string; // "Bought by Mistake"
    qcEnable?: boolean; // true
    qcProductName?: string; // "Tennis Ball"
    qcProductImage?: string; // "https://example.com/image.png"
  }>;
  paymentMethod: 'Prepaid'; // Always "Prepaid" for returns
  totalDiscount?: number; // 0
  subTotal: number; // 10
  dimensions: {
    length: number; // 10
    breadth: number; // 15
    height: number; // 20
  };
  weight: number; // 1
}

export interface ShipmentData {
  waybill?: string;
  shipmentId?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email?: string;
  weight: number; // Weight in kg
  productValue: number; // Value in INR
  productDescription: string;
  orderReference: string;
  paymentMode: 'COD' | 'PREPAID';
  codAmount?: number; // Required if paymentMode is COD
  dimensions?: {
    length: number; // Length in cm
    breadth: number; // Breadth in cm
    height: number; // Height in cm
  };
}