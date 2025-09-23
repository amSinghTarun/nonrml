import { logoSrc, escapeHtml } from "./helper";
import { ShippingNotificationData } from "./types";

interface ShippingNotificationOptions extends ShippingNotificationData {
    refundAmount?: number;
}

export const generateShippingNotificationEmail = (options: ShippingNotificationOptions): string => {
    
    const data = {
        orderId: options.orderId,
        waybillNumber: options.waybillNumber,
        trackingLink: options.trackingLink,
        refundAmount: options.refundAmount
    };

    // Generate the complete HTML email
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Order Shipped</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background-color: #f8f9fa; line-height: 1.6;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- Header with Logo -->
                <tr>
                    <td style="padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5e5e5; background-color: #ffffff;">
                        <img src="${logoSrc}" alt="NoNRML" style="height: 40px;">
                    </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                    <td style="padding: 40px 30px 30px;">
                        <h2 style="margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Your order ${escapeHtml(data.orderId)} has been shipped!</h2>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Dear NoNRML user,</p>
                        <p style="margin: 1px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Great news! Your order ${escapeHtml(data.orderId)} has been shipped and is on its way to you. You can track your package using the details below.</p>
                        
                        ${data.refundAmount && data.refundAmount > 0 ? `
                        <!-- Refund Notice -->
                        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0 0;">
                            <p style="margin: 0; font-size: 12px; color: #0369a1; line-height: 1.6;">
                                <strong>Refund Update:</strong> A refund of ₹${data.refundAmount.toFixed(2)} has been processed for this order. The amount will be credited to your original payment method within 5-7 business days.
                            </p>
                        </div>
                        ` : ''}
                        
                        <!-- Track Order Button -->
                        <div style="margin: 25px 0;">
                            <a href="www.nonrml.co.in/orders/${data.orderId}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 6px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; transition: background-color 0.2s;">View your order</a>
                            <span style="margin: 0 10px; color: #9ca3af;">or</span>
                            <a href="www.nonrml.co.in" style="color: #000000; text-decoration: none; font-size: 12px; font-weight: 500;">Visit our store</a>
                        </div>
                    </td>
                </tr>
                
                <!-- Tracking Details -->
                <tr>
                    <td style="padding: 0 30px 30px;">
                        <div style="border-radius: 8px; padding: 25px; border: 1px solid #000000;">
                            <h3 style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Tracking information</h3>
                            
                            <!-- Tracking Link Box -->
                            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
                                <h4 style="margin: 0 0 10px; font-size: 12px; font-weight: 600; color: #0ea5e9; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">📦 Track Your Package</h4>
                                <p style="margin: 0 0 15px; font-size: 12px; color: #0369a1; font-weight: 400;">Click the link below to get real-time updates on your shipment</p>
                                <a href="${escapeHtml(data.trackingLink!)}" style="display: inline-block; padding: 10px 20px; background-color: #0ea5e9; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 6px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Track Package</a>
                            </div>
                        </div>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 30px; text-align: center; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; background-color: #ffffff; border-top: 1px solid #000000;">
                        <p style="margin: 0 0 10px; color: #4a5568; font-weight: 400;">Questions about your shipment? Please contact our customer service team:</p>
                        <p style="margin: 0;"><a href="mailto:${process.env.CLIENT_SUPPORT_MAIL}" style="color: #000000; text-decoration: none; font-weight: 500;">${process.env.CLIENT_SUPPORT_MAIL}</a></p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};