// packages/shipping/src/shiprocket.ts
import axios from 'axios';
import type * as ShiprocketTypes from "./type";

export class ShiprocketShipping {
  private static baseUrl = process.env.SHIPROCKET_API_URL;
  private static apiToken = process.env.SHIPROCKET_API_TOKEN || "";

  // ---------------- CREATE ORDER ----------------
  static async createOrder(
    data: ShiprocketTypes.OrderData
  ): Promise<ShiprocketTypes.OrderResponse> {
    try {
      const formattedData = this.formatOrderData(data);

      const response = await axios.post(
        `${this.baseUrl}/v1/external/orders/create/adhoc`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          },
          timeout: 30000
        }
      );

      console.log("shiprocket response", response.data.data)

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
          error:
            response.data?.message ||
            response.data?.error ||
            'Failed to create order'
        };
      }
    } catch (error: any) {
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

  // ---------------- CHECK SERVICEABILITY ----------------
  static async checkServiceability(
    params: ShiprocketTypes.ServiceabilityParams
  ): Promise<any> {
    const queryParams: any = {
      pickup_postcode: params.pickupPostcode,
      delivery_postcode: params.deliveryPostcode,
      weight: params.weight || 0.5,
      cod: params.cod ? 1 : 0
    };

    if (params.orderId !== undefined) queryParams.order_id = params.orderId;
    if (params.length !== undefined) queryParams.length = params.length;
    if (params.breadth !== undefined) queryParams.breadth = params.breadth;
    if (params.height !== undefined) queryParams.height = params.height;
    if (params.declaredValue !== undefined)
      queryParams.declared_value = params.declaredValue;
    if (params.mode) queryParams.mode = params.mode;
    if (params.isReturn !== undefined)
      queryParams.is_return = params.isReturn ? 1 : 0;
    if (params.couriersType !== undefined)
      queryParams.couriers_type = params.couriersType;
    if (params.onlyLocal !== undefined)
      queryParams.only_local = params.onlyLocal;
    if (params.qcCheck !== undefined) queryParams.qc_check = params.qcCheck;

    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/external/courier/serviceability/`,
        {
          params: queryParams,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        }
      );

      let deliveryDetails = {
        id: '1',
        description: 'Free shipping',
        name: 'Delivery in 5-7 days',
        shipping_fee: 0,
        cod_fee: 0,
        serviceable: false,
        cod: false
      };

      if (
        response.data &&
        response.data.data &&
        response.data.data.available_courier_companies.length
      ) {
        deliveryDetails.serviceable = true;
        deliveryDetails.cod = true;
      }

      return deliveryDetails;
    } catch (error) {
      console.log('Error in shipping Serviceability api', error);
      throw new Error('Something went wrong, try after some time');
    }
  }

  // ---------------- CREATE RETURN ORDER ----------------
  static async createReturnOrder( data: ShiprocketTypes.ShiprocketReturnOrderPayload ): Promise<ShiprocketTypes.ReturnOrderResponse> {
    try {
      const formattedData = this.formatReturnOrderData(data);
      const response = await axios.post(
        `${this.baseUrl}/v1/external/orders/create/return`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          },
          timeout: 30000
        }
      );

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
          error:
            response.data?.message ||
            response.data?.error ||
            'Failed to create return order'
        };
      }
    } catch (error: any) {
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

  // ---------------- FORMAT HELPERS ----------------
  private static formatOrderData(data: ShiprocketTypes.OrderData): any {
    const formattedData: any = {
      order_id: `ORD-${data.orderId}`,
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
      billing_last_name: "",
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

    if (data.channelId) formattedData.channel_id = data.channelId;
    if (data.comment) formattedData.comment = data.comment;
    if (data.resellerName) formattedData.reseller_name = data.resellerName;
    if (data.companyName) formattedData.company_name = data.companyName;
    if (data.billing.address2) formattedData.billing_address_2 = data.billing.address2;
    if (data.billing.alternatePhone) formattedData.billing_alternate_phone = data.billing.alternatePhone;
    if (data.billing.isdCode) formattedData.billing_isd_code = data.billing.isdCode;

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

    if (data.shippingCharges !== undefined) formattedData.shipping_charges = data.shippingCharges;
    if (data.giftwrapCharges !== undefined) formattedData.giftwrap_charges = data.giftwrapCharges;
    if (data.transactionCharges !== undefined) formattedData.transaction_charges = data.transactionCharges;
    if (data.totalDiscount !== undefined) formattedData.total_discount = data.totalDiscount;

    if (data.longitude !== undefined) formattedData.longitude = data.longitude;
    if (data.latitude !== undefined) formattedData.latitude = data.latitude;

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

private static formatReturnOrderData( data: ShiprocketTypes.ShiprocketReturnOrderPayload ): ShiprocketTypes.ShiprocketReturnOrderPayload {
  const formatted: ShiprocketTypes.ShiprocketReturnOrderPayload = {
    // required top-level
    order_id: data.order_id,
    order_date: data.order_date,
    payment_method: 'Prepaid',
    sub_total: data.sub_total,
    length: data.length,
    breadth: data.breadth,
    height: data.height,
    weight: data.weight,

    // pickup (required fields)
    pickup_customer_name: data.pickup_customer_name,
    pickup_address: data.pickup_address,
    pickup_city: data.pickup_city,
    pickup_state: data.pickup_state,
    pickup_country: data.pickup_country,
    pickup_pincode: data.pickup_pincode,
    pickup_email: data.pickup_email,
    pickup_phone: data.pickup_phone,

    // shipping (required fields)
    shipping_customer_name: data.shipping_customer_name,
    shipping_address: data.shipping_address,
    shipping_city: data.shipping_city,
    shipping_state: data.shipping_state,
    shipping_country: data.shipping_country,
    shipping_pincode: data.shipping_pincode,
    shipping_phone: data.shipping_phone,

    // items
    order_items: data.order_items.map((item) => {
      const out: ShiprocketTypes.ShiprocketReturnOrderItem = {
        name: item.name,
        sku: item.sku,
        units: item.units,
        selling_price: item.selling_price,
      };

      // optional/conditional fields (only copy if provided)
      if (item.discount !== undefined) out.discount = item.discount;
      if (item.hsn) out.hsn = item.hsn;
      if (item.return_reason) out.return_reason = item.return_reason;

      if (item.qc_enable) out.qc_enable = item.qc_enable;
      if (item.qc_color) out.qc_color = item.qc_color;
      if (item.qc_brand) out.qc_brand = item.qc_brand;
      if (item.qc_serial_no) out.qc_serial_no = item.qc_serial_no;
      if (item.qc_ean_barcode) out.qc_ean_barcode = item.qc_ean_barcode;
      if (item.qc_size) out.qc_size = item.qc_size;
      if (item.qc_product_name) out.qc_product_name = item.qc_product_name;
      if (item.qc_product_image) out.qc_product_image = item.qc_product_image;
      if (item.qc_product_imei) out.qc_product_imei = item.qc_product_imei;
      if (item.qc_brand_tag !== undefined) out.qc_brand_tag = item.qc_brand_tag;
      if (item.qc_used_check !== undefined) out.qc_used_check = item.qc_used_check;
      if (item.qc_sealtag_check !== undefined)
        out.qc_sealtag_check = item.qc_sealtag_check;
      if (item.qc_check_damaged_product)
        out.qc_check_damaged_product = item.qc_check_damaged_product;

      return out;
    }),
  };

  // optional top-level
  if (data.channel_id !== undefined) formatted.channel_id = data.channel_id;
  if (data.total_discount !== undefined)
    formatted.total_discount = data.total_discount;

  // optional pickup fields
  if (data.pickup_last_name) formatted.pickup_last_name = data.pickup_last_name;
  if (data.pickup_address_2) formatted.pickup_address_2 = data.pickup_address_2;
  if (data.pickup_isd_code) formatted.pickup_isd_code = data.pickup_isd_code;

  // optional shipping fields
  if (data.shipping_last_name)
    formatted.shipping_last_name = data.shipping_last_name;
  if (data.shipping_address_2)
    formatted.shipping_address_2 = data.shipping_address_2;
  if (data.shipping_email) formatted.shipping_email = data.shipping_email;
  if (data.shipping_isd_code)
    formatted.shipping_isd_code = data.shipping_isd_code;

  return formatted;
  }
}