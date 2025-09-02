import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from "@/app/_trpc/serverClient"
import { ShiprocketTypes, ShiprocketShipping } from "@nonrml/shipping"

type RequestBody = {
  order_id: string, 
  razorpay_order_id: string, 
  email: string, 
  contact: string, 
  addresses: {
    id: string,
    zipcode: string,
    state_code: string,
    country: string
  }[]
}
export async function POST(request: NextRequest) {
    try {

      const requestBody: RequestBody = await request.json();
      console.log(requestBody)
  
      // const createDelivery = await ShiprocketShipping.createShipment(requestBody)
      // return NextResponse.json({"addresses": createDelivery}, { status: 200 })
      
      // await (await serverClient()).viewer.orders.sendOrderConfMail({orderId: requestBody.order_id})

      const {data: shippingDetails} = await (await serverClient()).viewer.orders.updateUserDetailAndCheckServicibility({
        addresses: requestBody.addresses,
        contactNumber: requestBody.contact,
        rzpOrderId: requestBody.razorpay_order_id,
      });

      
      return NextResponse.json({"addresses": shippingDetails}, { status: 200 })
    //   return NextResponse.json({
    //     "addresses": [
    //         {
    //             "id": "0",
    //             "zipcode": requestBody.addresses[0].zipcode,
    //             "state_code": requestBody.addresses[0].state_code,
    //             "country": requestBody.addresses[0].country,
    //             "serviceable": true,
    //             "cod": false,
    //             "cod_fee": 0,
    //             "shipping_fee": 0,
    //             "shipping_methods": [
    //                 {
    //                     "id": "1",
    //                     "description": "Free shipping",
    //                     "name": "Delivery in 5-7 days",
    //                     "shipping_fee": 0,
    //                     "cod_fee": 0,
    //                     "serviceable": true,
    //                     "cod": true
    //                 }
    //             ]
    //         }
    //     ]
    // }, { status: 200 })
  
    } catch (error) {
      console.error('Shipping API error:', error)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error' 
        },
        { status: 500 }
      )
    }
}

export async function OPTIONS(request: NextRequest) {
return new NextResponse(null, {
    status: 200,
    headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
})
}
