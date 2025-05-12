// packages/shipping/src/type.ts
export interface DelhiveryConfig {
    apiKey: string;
    baseUrl?: string;
    isProduction?: boolean;
    timeout?: number;
  }
  
  export interface PincodeServiceabilityParams {
    pincode: string;
  }
  
  export interface PincodeServiceabilityResponse {
    delivery_codes: string[];
    pin_code: string;
    status: boolean;
    error?: string;
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
  
  export interface ShipmentUpdateParams {
    waybill: string;
    name?: string;
    address?: string;
    phone?: string;
    weight?: number; // in grams
    length?: number; // shipment_length
    width?: number; // shipment_width
    height?: number; // shipment_height
    productDetails?: string; // product_details
    paymentMode?: 'COD' | 'PREPAID'; // pt
  }
  
  export interface ShipmentCancellationParams {
    waybill: string;
  }
  
  export interface ShipmentResponse {
    waybill: string;
    shipmentId: string;
    status: string;
    success: boolean;
    message?: string;
    error?: string;
  }
  
  export interface LabelGenerationResponse {
    labelUrl: string;
    success: boolean;
    error?: string;
  }
  
  export interface PickupRequestParams {
    pickupDate: string; // Format: YYYY-MM-DD
    pickupTime: string; // Format: HH:MM-HH:MM (e.g., "10:00-18:00")
    address: {
      name: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
      email?: string;
    };
    expectedPackageCount: number;
  }
  
  export interface PickupRequestResponse {
    pickupId: string;
    status: string;
    success: boolean;
    message?: string;
    error?: string;
  }