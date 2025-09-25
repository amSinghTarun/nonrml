import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from "@/app/_trpc/serverClient";
import { validateRzpWebhook } from '@nonrml/payment';
import { cacheServicesRedisClient } from '@nonrml/cache';
import { TRPCResponseStatus } from '@nonrml/common';

// Razorpay webhook event types we handle
const SUPPORTED_EVENTS = [
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'refund.created',
    'refund.processed',
    'refund.failed'
];

export async function POST(request: NextRequest) {
    try {
        // Read raw body first for signature validation
        const rawBody = await request.text();
        
        // Get headers
        const x_razorpay_event_id = request.headers.get("x-razorpay-event-id");
        const signature = request.headers.get("x-razorpay-signature");
        
        console.log('Webhook received:', {
            eventId: x_razorpay_event_id,
            hasSignature: !!signature,
            bodyLength: rawBody.length
        });

        // Validate required headers
        if (!signature || !x_razorpay_event_id) {
            console.error('Missing required headers:', { signature: !!signature, eventId: !!x_razorpay_event_id });
            return NextResponse.json({ 
                success: false, 
                error: "Missing required headers" 
            }, { status: 400 });
        }

        // Check for duplicate events using Redis
        try {
            const existingEvent = await cacheServicesRedisClient().get(x_razorpay_event_id);
            if (existingEvent) {
                console.log('Duplicate event detected:', x_razorpay_event_id);
                return NextResponse.json({ 
                    success: true, 
                    message: "Event already processed" 
                }, { status: 200 });
            }
        } catch (cacheError) {
            console.warn('Cache check failed, continuing with processing:', cacheError);
        }

        // Validate webhook signature
        try {
            validateRzpWebhook(rawBody, signature);
            console.log('Webhook signature validated successfully');
        } catch (validationError) {
            console.error('Webhook signature validation failed:', validationError);
            return NextResponse.json({ 
                success: false, 
                error: "Invalid webhook signature" 
            }, { status: 401 });
        }

        // Parse the validated body
        let requestBody;
        try {
            requestBody = JSON.parse(rawBody);
        } catch (parseError) {
            console.error('Failed to parse webhook body:', parseError);
            return NextResponse.json({ 
                success: false, 
                error: "Invalid JSON body" 
            }, { status: 400 });
        }

        console.log('Parsed webhook body:', JSON.stringify(requestBody, null, 2));

        // Validate event type
        const eventType = requestBody.event;
        if (!SUPPORTED_EVENTS.includes(eventType)) {
            console.log('Unsupported event type:', eventType);
            return NextResponse.json({ 
                success: true, 
                message: "Event type not processed" 
            }, { status: 200 });
        }

        // Process different event types
        let updateResult;
        
        switch (eventType) {
            case 'payment.authorized':
            case 'payment.captured':
            case 'payment.failed':
                updateResult = await handlePaymentEvent(requestBody);
                break;
                
            case 'refund.created':
            case 'refund.processed':
            case 'refund.failed':
                updateResult = await handleRefundEvent(requestBody);
                break;
                
            default:
                console.log('Unhandled event type:', eventType);
                return NextResponse.json({ 
                    success: true, 
                    message: "Event acknowledged but not processed" 
                }, { status: 200 });
        }

        // Mark event as processed if successful
        if (updateResult?.success) {
            try {
                await cacheServicesRedisClient().setex(x_razorpay_event_id, 86400, JSON.stringify({
                    processedAt: new Date().toISOString(),
                    eventType,
                    success: true
                }));
                console.log('Event marked as processed:', x_razorpay_event_id);
            } catch (cacheError) {
                console.warn('Failed to cache processed event:', cacheError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Webhook processed successfully",
            eventType,
            eventId: x_razorpay_event_id
        }, { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Webhook processing failed'
        }, { status: 500 });
    }
}

// Handle payment events (authorized, captured, failed)
async function handlePaymentEvent(requestBody: any) {
    try {
        const payment = requestBody.payload?.payment?.entity;
        
        if (!payment) {
            console.error('Payment entity missing from webhook payload');
            return { success: false, error: 'Invalid payment payload' };
        }

        const { order_id: rzpOrderId, status: paymentStatus, id: paymentId } = payment;
        
        if (!rzpOrderId || !paymentStatus) {
            console.error('Missing required payment fields:', { rzpOrderId, paymentStatus });
            return { success: false, error: 'Missing payment data' };
        }

        console.log('Processing payment event:', { 
            orderId: rzpOrderId, 
            status: paymentStatus, 
            paymentId 
        });

        const result = await (await serverClient()).viewer.payment.rzpPaymentUpdateWebhook({
            rzpOrderId,
            paymentStatus
        });

        if (result.status === TRPCResponseStatus.SUCCESS) {
            console.log('Payment status updated successfully');
            return { success: true };
        } else {
            console.error('Failed to update payment status:', result);
            return { success: false, error: 'Database update failed' };
        }

    } catch (error) {
        console.error('Error handling payment event:', error);
        return { success: false, error: 'Payment processing failed' };
    }
}

// Handle refund events (created, processed, failed)
async function handleRefundEvent(requestBody: any) {
    try {
        const refund = requestBody.payload?.refund?.entity;
        const payment = requestBody.payload?.payment?.entity;
        
        if (!refund) {
            console.error('Refund entity missing from webhook payload');
            return { success: false, error: 'Invalid refund payload' };
        }

        const refundId = refund.id;
        const refundStatus = refund.status;
        const rzpOrderId = payment?.order_id;

        if (!refundId || !refundStatus) {
            console.error('Missing required refund fields:', { refundId, refundStatus });
            return { success: false, error: 'Missing refund data' };
        }

        console.log('Processing refund event:', { 
            refundId, 
            status: refundStatus, 
            orderId: rzpOrderId 
        });

        const result = await (await serverClient()).viewer.payment.rzpPaymentUpdateWebhook({
            rzpOrderId,
            refundId,
            refundStatus,
            paymentStatus: payment?.status // Include payment status if available
        });

        if (result.status === TRPCResponseStatus.SUCCESS) {
            console.log('Refund status updated successfully');
            return { success: true };
        } else {
            console.error('Failed to update refund status:', result);
            return { success: false, error: 'Database update failed' };
        }

    } catch (error) {
        console.error('Error handling refund event:', error);
        return { success: false, error: 'Refund processing failed' };
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Razorpay-Signature, X-Razorpay-Event-Id',
        },
    });
}