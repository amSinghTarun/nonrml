import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from "@/app/_trpc/serverClient";

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
      const {data: shippingDetails} = await (await serverClient()).viewer.orders.updateUserDetailAndCheckServicibility({
        addresses: requestBody.addresses,
        // email: requestBody.email,
        // contact: requestBody.contact,
        rzpOrderId: requestBody.razorpay_order_id,
        // rzpOrderReceipt: requestBody.order_id
      });

      // Validate required fields
      return NextResponse.json( shippingDetails, { status: 200 })
  
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
