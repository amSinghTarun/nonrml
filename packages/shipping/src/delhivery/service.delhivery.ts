import axios from 'axios';
// import type * as DelhiveryTypes from "./type";

// {
//   "order_id": "SomeReceiptValue", // This is the receipt field set in the Razorpay order
//   "razorpay_order_id": "EKwxwAgItmmXdp", // This is the RZP order created without the `order_` prefix
//   "email": "gaurav.kumar@example.com", // Email field will be set if the customer enters an email
//   "contact": "+919900000000", // Customer phone number with country code
//   "addresses": [{
//     "id": "0", 
//     "zipcode": "560060",
//     "state_code": "KA",
//     "country": "IN"
//   }]
// }

export class DelhiveryShipping {
  static headers = {
    "Content-Type": "application/json",
    "Authorization": `Token ${process.env.DELHIVERY_API_TOKEN || ""}`
  };
   static baseUrl = process.env.NODE_ENV == "production" ? 'https://track.delhivery.com' : 'https://staging-express.delhivery.com';

  static async checkPincodeServiceability(params: {pincode: string}){
    try {
      // Using the specified URL for pincode check: c/api/pin-codes/json/?parameters
      // const response = await axios.get(`/c/api/pin-codes/json/`, {
      //   headers: DelhiveryShipping.headers,
      //   params: { 
      //     filter_codes: params.pincode 
      //   }
      // });

      let deliveryDetails = {
        "id": 1,
        "description": "Free shipping",
        "name": "Delivery in 5-7 days",
        "shipping_fee": 0,
        "cod_fee": 0,
        "serviceable": true,
        "cod": true
      };
      
      // if (response.data && response.data.delivery_codes && response.data.delivery_codes[0].cod == "Y") {
      //   deliveryDetails.serviceable = true
      //   deliveryDetails.cod = true
      // }

      return deliveryDetails;

    } catch (error) {
      console.log("Error in shipping Serviceability api", error)
      throw new Error("Something went wrong, try after some time");
    }
  }


  // async createShipment(data: DelhiveryTypes.ShipmentData): Promise<DelhiveryTypes.ShipmentResponse> {
  //   try {
  //     // Format the data as required by Delhivery API
  //     const formattedData = this.formatShipmentData(data);
      
  //     // Using the specified URL for shipment creation: api/cmu/create.json
  //     const response = await this.client.post('/api/cmu/create.json', formattedData);

  //     if (response.data.success) {
  //       return {
  //         waybill: response.data.packages?.[0]?.waybill || '',
  //         shipmentId: response.data.packages?.[0]?.refnum || '',
  //         status: 'Created',
  //         success: true
  //       };
  //     } else {
  //       return {
  //         waybill: '',
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: response.data.error || 'Failed to create shipment'
  //       };
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       return {
  //         waybill: '',
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: error.response.data?.error || error.message
  //       };
  //     }
  //     return {
  //       waybill: '',
  //       shipmentId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Unknown error occurred while creating shipment'
  //     };
  //   }
  // }

  // async updateShipment(params: DelhiveryTypes.ShipmentUpdateParams): Promise<DelhiveryTypes.ShipmentResponse> {
  //   if (!params.waybill) {
  //     return {
  //       waybill: '',
  //       shipmentId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Waybill is required for updating a shipment'
  //     };
  //   }

  //   try {
  //     // Prepare the update data as per Delhivery API requirements
  //     const updateData: Record<string, any> = {
  //       waybill: params.waybill
  //     };

  //     // Add optional fields if they are provided
  //     if (params.name) updateData.name = params.name;
  //     if (params.address) updateData.add = params.address;
  //     if (params.phone) updateData.phone = params.phone;
  //     if (params.weight) updateData.gm = params.weight;
  //     if (params.length) updateData.shipment_length = params.length;
  //     if (params.width) updateData.shipment_width = params.width;
  //     if (params.height) updateData.shipment_height = params.height;
  //     if (params.productDetails) updateData.product_details = params.productDetails;
  //     if (params.paymentMode) updateData.pt = params.paymentMode;

  //     // Create headers for this specific request
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Token ${this.apiKey}`
  //     };

  //     // Using the specified URL for shipment update: api/p/edit
  //     const response = await axios.post(`${this.baseUrl}/api/p/edit`, updateData, { headers });

  //     if (response.data.success || response.data.status === 'Success') {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: response.data.reference_number || '',
  //         status: 'Updated',
  //         success: true,
  //         message: response.data.message || 'Shipment updated successfully'
  //       };
  //     } else {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: response.data.error || response.data.message || 'Failed to update shipment'
  //       };
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: error.response.data?.error || error.response.data?.message || error.message
  //       };
  //     }
  //     return {
  //       waybill: params.waybill,
  //       shipmentId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Unknown error occurred while updating shipment'
  //     };
  //   }
  // }

  // async cancelShipment(params: DelhiveryTypes.ShipmentCancellationParams): Promise<DelhiveryTypes.ShipmentResponse> {
  //   if (!params.waybill) {
  //     return {
  //       waybill: '',
  //       shipmentId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Waybill is required for cancellation'
  //     };
  //   }

  //   try {
  //     // Prepare the cancellation data
  //     const cancellationData = {
  //       waybill: params.waybill,
  //       cancellation: 'true' // As per the API documentation
  //     };

  //     // Create headers for this specific request
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Token ${this.apiKey}`
  //     };

  //     // Using the specified URL for shipment cancellation: api/p/edit
  //     const response = await axios.post(`${this.baseUrl}/api/p/edit`, cancellationData, { headers });

  //     if (response.data.success || response.data.status === 'Success') {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: response.data.reference_number || '',
  //         status: 'Cancelled',
  //         success: true,
  //         message: response.data.message || 'Shipment cancelled successfully'
  //       };
  //     } else {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: response.data.error || response.data.message || 'Failed to cancel shipment'
  //       };
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       return {
  //         waybill: params.waybill,
  //         shipmentId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: error.response.data?.error || error.response.data?.message || error.message
  //       };
  //     }
  //     return {
  //       waybill: params.waybill,
  //       shipmentId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Unknown error occurred while cancelling shipment'
  //     };
  //   }
  // }

  // async generateShippingLabel(params: { waybill: string }): Promise<DelhiveryTypes.LabelGenerationResponse> {
  //   if (!params.waybill) {
  //     return {
  //       labelUrl: '',
  //       success: false,
  //       error: 'Waybill is required for generating label'
  //     };
  //   }

  //   try {
  //     // Create headers for this specific request
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Token ${this.apiKey}`
  //     };

  //     // Using the specified URL for label generation: api/p/packing_slip?wbns=waybill&pdf=true
  //     const url = `${this.baseUrl}/api/p/packing_slip?wbns=${params.waybill}&pdf=true`;
  //     const response = await axios.get(url, { headers });

  //     // For label generation, Delhivery typically returns a URL or a PDF file
  //     if (response.status === 200) {
  //       return {
  //         labelUrl: response.data.url || response.request.responseURL || url,
  //         success: true
  //       };
  //     } else {
  //       return {
  //         labelUrl: '',
  //         success: false,
  //         error: 'Failed to generate shipping label'
  //       };
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       return {
  //         labelUrl: '',
  //         success: false,
  //         error: error.response.data?.error || error.message
  //       };
  //     }
  //     return {
  //       labelUrl: '',
  //       success: false,
  //       error: 'Unknown error occurred while generating shipping label'
  //     };
  //   }
  // }

  // async createPickupRequest(params: DelhiveryTypes.PickupRequestParams): Promise<DelhiveryTypes.PickupRequestResponse> {
  //   try {
  //     const formattedData = {
  //       pickup_date: params.pickupDate,
  //       pickup_time: params.pickupTime,
  //       pickup_location: {
  //         name: params.address.name,
  //         address: params.address.address,
  //         city: params.address.city,
  //         state: params.address.state,
  //         pin: params.address.pincode,
  //         phone: params.address.phone,
  //         email: params.address.email || ''
  //       },
  //       expected_package_count: params.expectedPackageCount
  //     };

  //     // Create headers for this specific request
  //     const headers = {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Token ${this.apiKey}`
  //     };

  //     // Using the specified URL for pickup request: fm/request/new/
  //     const response = await axios.post(`${this.baseUrl}/fm/request/new/`, formattedData, { headers });

  //     if (response.data.success) {
  //       return {
  //         pickupId: response.data.pickup_id,
  //         status: response.data.status || 'Created',
  //         success: true
  //       };
  //     } else {
  //       return {
  //         pickupId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: response.data.error || 'Failed to create pickup request'
  //       };
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error) && error.response) {
  //       return {
  //         pickupId: '',
  //         status: 'Failed',
  //         success: false,
  //         error: error.response.data?.error || error.message
  //       };
  //     }
  //     return {
  //       pickupId: '',
  //       status: 'Failed',
  //       success: false,
  //       error: 'Unknown error occurred while creating pickup request'
  //     };
  //   }
  // }

  // private formatShipmentData(data: DelhiveryTypes.ShipmentData): any {
  //   const formattedData: any = {
  //     shipments: [
  //       {
  //         name: data.name,
  //         address: data.address,
  //         city: data.city,
  //         state: data.state,
  //         country: data.country,
  //         pin: data.pincode,
  //         phone: data.phone,
  //         email: data.email || '',
  //         order: data.orderReference,
  //         payment_mode: data.paymentMode,
  //         total_amount: data.productValue,
  //         cod_amount: data.paymentMode === 'COD' ? (data.codAmount || data.productValue) : 0,
  //         product_desc: data.productDescription,
  //         weight: data.weight
  //       }
  //     ]
  //   };

  //   // Add dimensions if provided
  //   if (data.dimensions) {
  //     formattedData.shipments[0].dimensions = {
  //       length: data.dimensions.length,
  //       breadth: data.dimensions.breadth,
  //       height: data.dimensions.height
  //     };
  //   }

  //   // Add waybill or reference number if provided
  //   if (data.waybill) {
  //     formattedData.shipments[0].waybill = data.waybill;
  //   }
  //   if (data.shipmentId) {
  //     formattedData.shipments[0].refnum = data.shipmentId;
  //   }

  //   return formattedData;
  // }
}