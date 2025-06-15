export interface PincodeServiceabilityParams {
  pincode: string;
}

export interface ShipmentData {
  name: string;
  add: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  order: string;
  payment_mode: "Prepaid" | "COD";
  return_pin?: string;
  return_city?: string;
  return_phone?: string;
  return_add?: string;
  return_state?: string;
  return_country?: string;
  products_desc: string;
  hsn_code?: string; 
  cod_amount: string;
  order_date: Date | null;
  total_amount: string;
  seller_add?: string;
  seller_name?: string;
  seller_inv?: string;
  quantity: string;
  waybill?: string;
  shipment_width: string;
  shipment_height: string;
  weight: string;
  seller_gst_tin: string;
  shipping_mode: "Surface" | "Air";
  address_type: "home" | "office";
}

export interface PickupLocation {
  name: string;
  add: string;
  city: string;
  pin_code: number;
  country: string;
  phone: string;
}

export interface CreateDeliveryData {
  shipments: ShipmentData[];
  pickup_location: PickupLocation;
}