import { serverClient } from '@/app/_trpc/serverClient';
import { ShiprocketShipping } from '@nonrml/shipping';
import { NextRequest, NextResponse } from 'next/server';

// Helper function to validate webhook headers
const validateHeaders = (request: NextRequest) => {
  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { valid: false, error: 'Invalid content type. Expected application/json' };
  }

  // Validate x-api-key header for Shiprocket
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return { valid: false, error: 'Missing x-api-key header' };
  }

  // Validate API key against environment variable
  const expectedApiKey = process.env.SHIPROCKET_WEBHOOK_API_KEY;
  if (!expectedApiKey || apiKey !== expectedApiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

// Helper function to validate Shiprocket webhook payload structure
const validatePayload = (payload: {[x: string]: any}) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const { awb, current_status, order_id } = payload;
  if (!awb || !current_status || !order_id) {
    return false;
  }

  return true;
}

// Helper function to fetch order details for security validation
const fetchOrderDetails = async (orderId: string) => {
  try {
    const response = await fetch(`${process.env.SHIPROCKET_API_URL}/v1/external/orders/show/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await ShiprocketShipping.ShiprocketShipping.getShiptocketToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

// Helper function to map Shiprocket status to our system status
const mapShiprocketStatus = (shiprocketStatus: string): string | null => {
  const statusMap: {[key: string]: string} = {
    'IN TRANSIT': 'InTransit',
    'SHIPPED': 'Shipped',
    'DELIVERED': 'Delivered'
  };

  // there should be a failed delviery type thing

  return statusMap[shiprocketStatus.toUpperCase()] || null;
}

// POST handler for Shiprocket webhook
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    
    // Validate request headers
    const headerValidation = validateHeaders(request);
    if (!headerValidation.valid) {
      console.warn(`Shiprocket header validation failed: ${headerValidation.error}`, {
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          success: false,
          message: 'Unauthorized'
        },
        { status: 200 }
      );
    }

    // Parse JSON body
    const body = await request.json();

    // Validate payload structure
    if (!validatePayload(body)) {
      console.warn('Invalid Shiprocket payload structure:', body);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid payload structure'
        },
        { status: 200 }
      );
    }

    const { awb, current_status, order_id } = body;

    let NoNRMLOrderId = order_id.split("-")[1].slice(0, -6);

    // Map Shiprocket status to our system status
    const mappedStatus = mapShiprocketStatus(current_status);
    
    // Only process if status is one of the allowed statuses
    if (!mappedStatus) {
      console.log(`Shiprocket webhook ignored - status not tracked: ${current_status} for AWB: ${awb}`);
      return NextResponse.json(
        {
          success: true,
          message: 'Webhook received but status not tracked'
        },
        { status: 200 }
      );
    }

    // Fetch order details for security validation
    let orderDetails;
    try {
      console.log(mappedStatus, awb, ".",  current_status, ".", NoNRMLOrderId, `OrderPrinted ${NoNRMLOrderId}`)
      orderDetails = await fetchOrderDetails(NoNRMLOrderId);
    } catch (error) {
      console.error(`Failed to fetch order details for NoNRMLOrderId: ${NoNRMLOrderId}`, error);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to validate order details'
        },
        { status: 200 }
      );
    }

    // Log the webhook data for debugging
    console.log('Shiprocket Webhook Received (Processing):', {
      timestamp: new Date().toISOString(),
      awb: awb,
      originalStatus: current_status,
      mappedStatus: mappedStatus,
      orderId: NoNRMLOrderId,
      orderValidated: !!orderDetails
    });

    // Process the shipment status update
    const webhookResponse = await (await serverClient()).viewer.orders.updateShipmentStatus({ 
      awb: awb,
      orderId: NoNRMLOrderId,
      shipmentStatus: mappedStatus 
    });

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log successful processing
    console.log(`Shiprocket webhook processed successfully in ${responseTime}ms for AWB: ${awb}, Status: ${mappedStatus}`);
    
    // Always return 200 OK as required by Shiprocket
    return NextResponse.json(
      { 
        success: true, 
        message: 'Webhook processed successfully', 
        data: { 
          awb,
          status: mappedStatus,
          responseTime: `${responseTime}ms` 
        }
      },
      { status: 200 }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Shiprocket webhook processing error:', {
        responseTime: `${responseTime}ms`,
        error: error
    });

    // Always return 200 OK to prevent Shiprocket retries
    return NextResponse.json(
      { 
        success: false,
        message: 'Webhook received but processing failed'
      },
      { status: 200 }
    );
  }
}