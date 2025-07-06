// packages/shipping/src/type.ts - Complete and fixed file
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
  email?: string;
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
export interface ReturnOrderAddress {
  customerName: string;
  lastName?: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
  email: string;
  phone: string;
  isdCode?: string;
}

export interface ReturnOrderItem {
  name: string;
  sku: string;
  units: number;
  sellingPrice: number;
  discount?: number;
  hsn?: string;
  returnReason?: string;
  // QC (Quality Check) fields
  qcEnable?: boolean;
  qcColor?: string;
  qcBrand?: string;
  qcSerialNo?: string;
  qcEanBarcode?: string;
  qcSize?: string;
  qcProductName?: string;
  qcProductImage?: string;
  qcProductImei?: string;
  qcBrandTag?: boolean;
  qcUsedCheck?: boolean;
  qcSealtagCheck?: boolean;
  qcCheckDamagedProduct?: 'yes' | 'no';
}

export interface ReturnOrderData {
  orderId: string;
  orderDate: string; // Format: "YYYY-MM-DD"
  channelId?: number;
  
  // Pickup details (where the package is picked up from - customer's location)
  pickup: ReturnOrderAddress;
  
  // Shipping details (where the package is shipped to - your warehouse/store)
  shipping: ReturnOrderAddress;
  
  // Order items being returned
  orderItems: ReturnOrderItem[];
  
  // Payment method - should always be "Prepaid" for returns
  paymentMethod: 'Prepaid';
  
  // Pricing details
  totalDiscount?: number;
  subTotal: number;
  
  // Package dimensions and weight
  dimensions: Dimensions;
  weight: number;
}

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

// Possible return reason values as per Shiprocket documentation
export type ReturnReason = 
  | 'Bought by Mistake'
  | 'Both product and shipping box damaged'
  | 'Defective Product'
  | 'Wrong Product'
  | 'Size Issue'
  | 'Color Issue'
  | 'Quality Issue'
  | 'Not as described'
  | 'Delayed Delivery'
  | 'Changed Mind'
  | 'Better Price Available'
  | 'Accidental Order'
  | 'Missing Parts'
  | 'Packaging Issue'
  | 'Other';

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