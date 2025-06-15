import axios from 'axios';
import type * as DelhiveryTypes from "./type";

export class DelhiveryShipping {

  static headers = {
    'Content-Type': 'application/json',
    "Authorization": `Token ${process.env.DELHIVERY_API_TOKEN || ""}`
  };

  static baseUrl = process.env.NODE_ENV == "production" ? 'https://track.delhivery.com' : 'https://track.delhivery.com';

  static async checkPincodeServiceability(data: DelhiveryTypes.PincodeServiceabilityParams){
    try {
      // Using the specified URL for pincode check: c/api/pin-codes/json/?parameters
      const response = await axios.get(`${this.baseUrl}/c/api/pin-codes/json/`, {
        headers: DelhiveryShipping.headers,
        params: { 
          filter_codes: data.pincode 
        }
      });

      let deliveryDetails = {
        "id": "1",
        "description": "Free shipping",
        "name": "Delivery in 5-7 days",
        "shipping_fee": 0,
        "cod_fee": 0,
        "serviceable": false,
        "cod": false
      };
      if (response.data && response.data.delivery_codes.length && response.data.delivery_codes[0].postal_code.cod == "Y") {
        console.log(response.data.delivery_codes[0].postal_code) 
        deliveryDetails.serviceable = true
        deliveryDetails.cod = true
      }

      return deliveryDetails;
      
    } catch (error) {
      console.log("Error in shipping Serviceability api", error)
      throw new Error("Something went wrong, try after some time");
    }
  }

  static async createShipment(data: DelhiveryTypes.ShipmentData){
      try {

        const requestData = new URLSearchParams();
        requestData.append('format', 'json');
        requestData.append('data', JSON.stringify(data));

        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${this.baseUrl}/api/cmu/create.json`,
          headers: {...DelhiveryShipping.headers,  'Content-Type': 'application/x-www-form-urlencoded'},
          data : requestData
        }

        const response = await axios.request(config);
 
        console.log("order Create response", response.data);

        const waybill = response.data.packages?.[0]?.waybill || '';
        const status = response.data.status;

        return {
          waybill: waybill,
          status: status
        };

      } catch (error) {
        console.log("Error in Delhivery Order Creation api  ", error)
        throw new Error("Something went wrong, try after some time");
      }
  }

}