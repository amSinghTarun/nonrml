// packages/shipping/src/shiprocket.ts
import axios, { AxiosInstance, AxiosRequestConfig, type AxiosHeaders } from 'axios';
import type * as ShiprocketTypes from "./type";

export class ShiprocketShipping {
  private client: AxiosInstance;
  private apiToken: string;
  private baseUrl: string;

  constructor(config: ShiprocketTypes.ShiprocketConfig) {
    this.apiToken = config.apiToken;
    const isProduction = config.isProduction ?? true;
    this.baseUrl = config.baseUrl || (isProduction ? 'https://apiv2.shiprocket.in' : 'https://staging-apiv2.shiprocket.in');
    const timeout = config.timeout || 30000;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      }
    });
    
    // Add request interceptor to ensure headers are set correctly for all requests
    this.client.interceptors.request.use((config) => {
      // Set the required headers directly
      config.headers['Content-Type'] = 'application/json';
      config.headers['Authorization'] = `Bearer ${this.apiToken}`;
      
      return config;
    });
  }

  async createOrder(data: ShiprocketTypes.OrderData): Promise<ShiprocketTypes.OrderResponse> {
    try {
      // Format the data as required by Shiprocket API
      const formattedData = this.formatOrderData(data);
      
      // Using the Shiprocket API endpoint for order creation
      const response = await this.client.post('/v1/external/orders/create/adhoc', formattedData);

      if (response.data && response.data.order_id) {
        return {
          orderId: response.data.order_id,
          shipmentId: response.data.shipment_id || '',
          channelOrderId: response.data.channel_order_id || '',
          status: response.data.status || 'Created',
          success: true,
          message: response.data.message || 'Order created successfully'
        };
      } else {
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: response.data?.message || response.data?.error || 'Failed to create order'
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: errorData?.message || errorData?.error || error.message,
          details: errorData?.errors || undefined
        };
      }
      return {
        orderId: '',
        shipmentId: '',
        channelOrderId: '',
        status: 'Failed',
        success: false,
        error: 'Unknown error occurred while creating order'
      };
    }
  }

  async checkServiceability(params: ShiprocketTypes.ServiceabilityParams): Promise<ShiprocketTypes.ServiceabilityResponse> {
    try {
      // Validate required parameters
      if (!params.pickupPostcode || !params.deliveryPostcode) {
        return {
          success: false,
          error: 'Pickup and delivery postcodes are required',
          couriers: [],
          pickupPostcode: params.pickupPostcode || 0,
          deliveryPostcode: params.deliveryPostcode || 0
        };
      }

      // Prepare query parameters
      const queryParams: any = {
        pickup_postcode: params.pickupPostcode,
        delivery_postcode: params.deliveryPostcode
      };

      // Add optional parameters if provided
      if (params.orderId !== undefined) queryParams.order_id = params.orderId;
      if (params.cod !== undefined) queryParams.cod = params.cod ? 1 : 0;
      if (params.weight !== undefined) queryParams.weight = params.weight;
      if (params.length !== undefined) queryParams.length = params.length;
      if (params.breadth !== undefined) queryParams.breadth = params.breadth;
      if (params.height !== undefined) queryParams.height = params.height;
      if (params.declaredValue !== undefined) queryParams.declared_value = params.declaredValue;
      if (params.mode) queryParams.mode = params.mode;
      if (params.isReturn !== undefined) queryParams.is_return = params.isReturn ? 1 : 0;
      if (params.couriersType !== undefined) queryParams.couriers_type = params.couriersType;
      if (params.onlyLocal !== undefined) queryParams.only_local = params.onlyLocal;
      if (params.qcCheck !== undefined) queryParams.qc_check = params.qcCheck;

      // Using the Shiprocket API endpoint for serviceability check
      const response = await this.client.get('/v1/external/courier/serviceability/', {
        params: queryParams
      });

      if (response.data && response.data.data) {
        const couriers = response.data.data.available_courier_companies || [];
        
        return {
          success: true,
          couriers: couriers,
          pickupPostcode: params.pickupPostcode,
          deliveryPostcode: params.deliveryPostcode,
          message: response.data.message || 'Serviceability checked successfully'
        };
      } else {
        return {
          success: false,
          error: response.data?.message || 'No courier serviceability data found',
          couriers: [],
          pickupPostcode: params.pickupPostcode,
          deliveryPostcode: params.deliveryPostcode
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        return {
          success: false,
          error: errorData?.message || errorData?.error || error.message,
          couriers: [],
          pickupPostcode: params.pickupPostcode,
          deliveryPostcode: params.deliveryPostcode,
          details: errorData?.errors || undefined
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred while checking serviceability',
        couriers: [],
        pickupPostcode: params.pickupPostcode,
        deliveryPostcode: params.deliveryPostcode
      };
    }
  }

  async createReturnOrder(data: ShiprocketTypes.ReturnOrderData): Promise<ShiprocketTypes.ReturnOrderResponse> {
    try {
      // Validate required parameters
      if (!data.orderId || !data.orderDate) {
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: 'Order ID and order date are required'
        };
      }

      if (!data.pickup || !data.shipping) {
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: 'Both pickup and shipping addresses are required'
        };
      }

      if (!data.orderItems || data.orderItems.length === 0) {
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: 'At least one order item is required'
        };
      }

      // Format the data as required by Shiprocket API
      const formattedData = this.formatReturnOrderData(data);
      
      // Using the Shiprocket API endpoint for return order creation
      const response = await this.client.post('/v1/external/orders/create/return', formattedData);

      if (response.data && response.data.order_id) {
        return {
          orderId: response.data.order_id,
          shipmentId: response.data.shipment_id || '',
          channelOrderId: response.data.channel_order_id || '',
          status: response.data.status || 'Created',
          success: true,
          message: response.data.message || 'Return order created successfully'
        };
      } else {
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: response.data?.message || response.data?.error || 'Failed to create return order'
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        return {
          orderId: '',
          shipmentId: '',
          channelOrderId: '',
          status: 'Failed',
          success: false,
          error: errorData?.message || errorData?.error || error.message,
          details: errorData?.errors || undefined
        };
      }
      return {
        orderId: '',
        shipmentId: '',
        channelOrderId: '',
        status: 'Failed',
        success: false,
        error: 'Unknown error occurred while creating return order'
      };
    }
  }

  private formatOrderData(data: ShiprocketTypes.OrderData): any {
    const formattedData: any = {
      order_id: data.orderId,
      order_date: data.orderDate,
      pickup_location: data.pickupLocation,
      billing_customer_name: data.billing.customerName,
      billing_address: data.billing.address,
      billing_city: data.billing.city,
      billing_pincode: data.billing.pincode,
      billing_state: data.billing.state,
      billing_country: data.billing.country,
      billing_email: data.billing.email,
      billing_phone: data.billing.phone,
      shipping_is_billing: data.shippingIsBilling,
      order_items: data.orderItems.map(item => ({
        name: item.name,
        sku: item.sku,
        units: item.units,
        selling_price: item.sellingPrice,
        discount: item.discount || '',
        tax: item.tax || '',
        hsn: item.hsn || ''
      })),
      payment_method: data.paymentMethod,
      sub_total: data.subTotal,
      length: data.dimensions.length,
      breadth: data.dimensions.breadth,
      height: data.dimensions.height,
      weight: data.weight
    };

    // Add optional fields if provided
    if (data.channelId) formattedData.channel_id = data.channelId;
    if (data.comment) formattedData.comment = data.comment;
    if (data.resellerName) formattedData.reseller_name = data.resellerName;
    if (data.companyName) formattedData.company_name = data.companyName;
    if (data.billing.lastName) formattedData.billing_last_name = data.billing.lastName;
    if (data.billing.address2) formattedData.billing_address_2 = data.billing.address2;
    if (data.billing.alternatePhone) formattedData.billing_alternate_phone = data.billing.alternatePhone;
    if (data.billing.isdCode) formattedData.billing_isd_code = data.billing.isdCode;

    // Add shipping details if shipping is not same as billing
    if (!data.shippingIsBilling && data.shipping) {
      formattedData.shipping_customer_name = data.shipping.customerName;
      formattedData.shipping_address = data.shipping.address;
      formattedData.shipping_city = data.shipping.city;
      formattedData.shipping_pincode = data.shipping.pincode;
      formattedData.shipping_state = data.shipping.state;
      formattedData.shipping_country = data.shipping.country;
      formattedData.shipping_phone = data.shipping.phone;

      if (data.shipping.lastName) formattedData.shipping_last_name = data.shipping.lastName;
      if (data.shipping.address2) formattedData.shipping_address_2 = data.shipping.address2;
      if (data.shipping.email) formattedData.shipping_email = data.shipping.email;
    }

    // Add optional charges and fees
    if (data.shippingCharges !== undefined) formattedData.shipping_charges = data.shippingCharges;
    if (data.giftwrapCharges !== undefined) formattedData.giftwrap_charges = data.giftwrapCharges;
    if (data.transactionCharges !== undefined) formattedData.transaction_charges = data.transactionCharges;
    if (data.totalDiscount !== undefined) formattedData.total_discount = data.totalDiscount;

    // Add optional location data
    if (data.longitude !== undefined) formattedData.longitude = data.longitude;
    if (data.latitude !== undefined) formattedData.latitude = data.latitude;

    // Add optional business fields
    if (data.ewaybillNo) formattedData.ewaybill_no = data.ewaybillNo;
    if (data.customerGstin) formattedData.customer_gstin = data.customerGstin;
    if (data.invoiceNumber) formattedData.invoice_number = data.invoiceNumber;
    if (data.orderType) formattedData.order_type = data.orderType;
    if (data.checkoutShippingMethod) formattedData.checkout_shipping_method = data.checkoutShippingMethod;
    if (data.what3wordsAddress) formattedData.what3words_address = data.what3wordsAddress;
    if (data.isInsuranceOpt !== undefined) formattedData.is_insurance_opt = data.isInsuranceOpt;
    if (data.isDocument !== undefined) formattedData.is_document = data.isDocument;
    if (data.orderTag) formattedData.order_tag = data.orderTag;

    return formattedData;
  }

  private formatReturnOrderData(data: ShiprocketTypes.ReturnOrderData): any {
    const formattedData: any = {
      order_id: data.orderId,
      order_date: data.orderDate,
      payment_method: data.paymentMethod,
      sub_total: data.subTotal,
      length: data.dimensions.length,
      breadth: data.dimensions.breadth,
      height: data.dimensions.height,
      weight: data.weight
    };

    // Add optional channel ID
    if (data.channelId) formattedData.channel_id = data.channelId;

    // Add pickup address (customer's location)
    formattedData.pickup_customer_name = data.pickup.customerName;
    formattedData.pickup_address = data.pickup.address;
    formattedData.pickup_city = data.pickup.city;
    formattedData.pickup_state = data.pickup.state;
    formattedData.pickup_country = data.pickup.country;
    formattedData.pickup_pincode = data.pickup.pincode;
    formattedData.pickup_email = data.pickup.email;
    formattedData.pickup_phone = data.pickup.phone;

    // Add optional pickup address fields
    if (data.pickup.lastName) formattedData.pickup_last_name = data.pickup.lastName;
    if (data.pickup.address2) formattedData.pickup_address_2 = data.pickup.address2;
    if (data.pickup.isdCode) formattedData.pickup_isd_code = data.pickup.isdCode;

    // Add shipping address (your warehouse/store)
    formattedData.shipping_customer_name = data.shipping.customerName;
    formattedData.shipping_address = data.shipping.address;
    formattedData.shipping_city = data.shipping.city;
    formattedData.shipping_country = data.shipping.country;
    formattedData.shipping_pincode = data.shipping.pincode;
    formattedData.shipping_state = data.shipping.state;
    formattedData.shipping_phone = data.shipping.phone;

    // Add optional shipping address fields
    if (data.shipping.lastName) formattedData.shipping_last_name = data.shipping.lastName;
    if (data.shipping.address2) formattedData.shipping_address_2 = data.shipping.address2;
    if (data.shipping.email) formattedData.shipping_email = data.shipping.email;
    if (data.shipping.isdCode) formattedData.shipping_isd_code = data.shipping.isdCode;

    // Add order items
    formattedData.order_items = data.orderItems.map(item => {
      const formattedItem: any = {
        name: item.name,
        sku: item.sku,
        units: item.units,
        selling_price: item.sellingPrice
      };

      // Add optional item fields
      if (item.discount !== undefined) formattedItem.discount = item.discount;
      if (item.hsn) formattedItem.hsn = item.hsn;
      if (item.returnReason) formattedItem.return_reason = item.returnReason;

      // Add QC (Quality Check) fields
      if (item.qcEnable !== undefined) formattedItem.qc_enable = item.qcEnable ? 'true' : 'false';
      if (item.qcColor) formattedItem.qc_color = item.qcColor;
      if (item.qcBrand) formattedItem.qc_brand = item.qcBrand;
      if (item.qcSerialNo) formattedItem.qc_serial_no = item.qcSerialNo;
      if (item.qcEanBarcode) formattedItem.qc_ean_barcode = item.qcEanBarcode;
      if (item.qcSize) formattedItem.qc_size = item.qcSize;
      if (item.qcProductName) formattedItem.qc_product_name = item.qcProductName;
      if (item.qcProductImage) formattedItem.qc_product_image = item.qcProductImage;
      if (item.qcProductImei) formattedItem.qc_product_imei = item.qcProductImei;
      if (item.qcBrandTag !== undefined) formattedItem.qc_brand_tag = item.qcBrandTag;
      if (item.qcUsedCheck !== undefined) formattedItem.qc_used_check = item.qcUsedCheck;
      if (item.qcSealtagCheck !== undefined) formattedItem.qc_sealtag_check = item.qcSealtagCheck;
      if (item.qcCheckDamagedProduct) formattedItem.qc_check_damaged_product = item.qcCheckDamagedProduct;

      return formattedItem;
    });

    // Add optional total discount
    if (data.totalDiscount !== undefined) formattedData.total_discount = data.totalDiscount;

    return formattedData;
  }
}