import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from "@/app/_trpc/serverClient";
import { validateRzpWebhook } from '@nonrml/payment';
import { cacheServicesRedisClient } from '@nonrml/cache';
import { TRPCResponseStatus } from '@nonrml/common';

// webhook for refund and payment both
export async function POST(request: NextRequest) {
    try {
        const requestBody = await request.json();
        console.log(requestBody)

        let x_razorpay_event_id = request.headers.get("x-razorpay-event-id");
        let signature = request.headers.get("X-Razorpay-Signature");
        
        if(!signature || !x_razorpay_event_id)
            throw {code: "BAD_REQUEST", message: "Headers missing"
        }

        //check x-razorpay-event-id for uniqueness
        const notUniqueRequest = await cacheServicesRedisClient().get(x_razorpay_event_id);
        if(notUniqueRequest)
            return NextResponse.json({ status: 200 })

        // validate the request
        let rawBody = request.body;
        validateRzpWebhook(JSON.stringify(rawBody), signature || "");

        let rzpOrderId = requestBody.payload.payment.entity.order_id;
        let rzpPaymentStatus = requestBody.payload.payment.entity.status;

        // the same request will have refund data as well
        let refundId = "";
        let refundStatus = "";
        if(requestBody.payload.refund){
            refundId = requestBody.payload.refund.entity.id
            refundStatus = requestBody.payload.refund.entity.status 
        }

        if(rzpPaymentStatus && rzpOrderId) {
            // capture can come before authorised
            const statusUpdated = await (await serverClient()).viewer.payment.rzpPaymentUpdateWebhook({
                rzpOrderId: rzpOrderId,
                paymentStatus: rzpPaymentStatus,
                ...(refundId != "" && {
                    refundId,
                    refundStatus
                })
            });
            if(statusUpdated.status == TRPCResponseStatus.SUCCESS){
                await cacheServicesRedisClient().set(x_razorpay_event_id, true, {ex: 86400})
            }
        }

        return NextResponse.json({ status: 200 })
  
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
