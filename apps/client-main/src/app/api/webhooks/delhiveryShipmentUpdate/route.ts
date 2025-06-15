import { serverClient } from '@/app/_trpc/serverClient';
import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";

// Helper function to validate webhook headers
const validateHeaders = (request: NextRequest) => {
  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { valid: false, error: 'Invalid content type. Expected application/json' };
  }

  // Example: Validate custom authentication header
  const apiKey = request.headers.get('authorization');
  if ( !apiKey || !apiKey.search("Token ") ) {
    return { valid: false, error: 'Missing authentication header' };
  }

  try{
    jwt.verify(apiKey.split("Token ")[1], process.env.DELHIVERY_WEBHOOK_JWT!)
  } catch(error){
    return { valid: false, error: "JWT verification failed: Invalid JWT token"}
  }

  // Validate API key against environment variable
  const expectedApiKey = process.env.DELHIVERY_WEBHOOK_API_KEY;
  if (expectedApiKey && apiKey !== expectedApiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

// Helper function to validate webhook payload structure
const validatePayload = (payload:{[x: string]: string}) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const { Shipment } = payload;
  if (!Shipment || typeof Shipment !== 'object') {
    return false;
  }

  const { Status, AWB } = Shipment;
  if (!Status || !AWB) {
    return false;
  }

  const { Status: statusValue, StatusDateTime, StatusType } = Status;
  if (!statusValue || !StatusDateTime || !StatusType) {
    return false;
  }

  return true;
}

// POST handler for webhook
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    
    // Validate request headers
    const headerValidation = validateHeaders(request);
    if (!headerValidation.valid) {
      console.warn(`Header validation failed: ${headerValidation.error}`, {
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: headerValidation.error
        },
        { status: 401 }
      );
    }

    // Parse JSON body
    const body = await request.json();

    // Validate payload structure
    if (!validatePayload(body)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid payload structure'
        },
        { status: 400 }
      );
    }

    const { Shipment } = body;
    const { Status, AWB, ReferenceNo } = Shipment;

    // Log the webhook data for debugging
    console.log( 'Delhivery Webhook Received:', {
      timestamp: new Date().toISOString(),
      awb: AWB,
      status: Status.Status,
      statusType: Status.StatusType,
      statusDateTime: Status.StatusDateTime,
      referenceNo: ReferenceNo
    });

    // Process the shipment scan based on status
    const webhookResponse = await (await serverClient()).viewer.orders.updateShipmentStatus({ shipmentId: AWB, shipmentStatus: Status.status });

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log successful processing
    console.log(`Webhook processed successfully in ${responseTime}ms for AWB: ${AWB}`);
    
    // Return 200 OK as required by Delhivery
    return NextResponse.json(
      { success: true, message: 'Webhook processed successfully', body: { data: webhookResponse, responseTime: `${responseTime}ms` }},
      { status: 200 }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Webhook processing error:', {
        responseTime: `${responseTime}ms`,
        error: error
    });

    // Return 200 OK even on error to prevent Delhivery retries
    // Log the error internally but don't expose it to Delhivery
    return NextResponse.json(
      { 
        success: false,
        message: 'Webhook received but processing failed',
        error: error
      },
      { status: 200 }
    );
  }
}