export interface Product {
    sku: string;
    image: string,
    size: string,
    quantity: number;
    price: number;
}
  
export interface ShippingAddress {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export interface OrderConfirmationData {
    customerName: string;
    customerNumber: string;
    orderId: string;
    orderDate: string;
    products: Product[];
    credit: number;
    total: number;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
}

export interface ShippingNotificationData {
    orderId: string;
    waybillNumber?: string;
    trackingLink?: string;
}

export interface CreditNoteData {
    creditNoteId: string;
    originalOrderNumber: string;
    creditAmount: number;
    creditNoteExpiry: string;
    customerMobile: string;
}

export interface RefundNotificationData {
    orderId: string;
    orderIdVarChar: string;
    bankRefundAmount: number;
    creditNoteId?: string;
    creditNoteAmount?: number;
    creditNoteExpiry?: Date;
}