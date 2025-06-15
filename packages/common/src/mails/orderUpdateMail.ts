import {logoSrc, escapeHtml} from "./helper"

const chooseCancelReason = {
    "UNAVAILABILITY": 'has been cancelled by our team due to unavailability',
    "ACCEPTED_ORDER": 'has been cancelled by our team as per your request',
    "USER_PRE_ACCEPTANCE_CANCEL": "has been cancelled as per your request"
}

export const generateOrderCancellationEmail = (orderId: string, orderIdVarChar: string, cancelReason: keyof typeof chooseCancelReason): string => {

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Order Cancellation</title>
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
                        <h2 style="margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Order Cancellation Notice</h2>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Dear Customer,</p>
                        <p style="margin: 1px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Your order ORD-${escapeHtml(orderId)}${escapeHtml(orderIdVarChar)} ${escapeHtml(chooseCancelReason[cancelReason])}. Any payments made will be refunded within 5-7 working days.</p>
                        <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">We apologize for any inconvenience caused.</p>
                        <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Best regards,<br />Customer Service Team</p>
                        
                        <!-- Visit Store Button -->
                        <div style="margin: 25px 0;">
                            <a href="www.nonorml.com" style="color: #000000; text-decoration: none; font-size: 12px; font-weight: 500;">Visit our store</a>
                        </div>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 30px; text-align: center; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; background-color: #ffffff; border-top: 1px solid #000000;">
                        <p style="margin: 0 0 10px; color: #4a5568; font-weight: 400;">Questions about your order? Please contact our customer service team:</p>
                        <p style="margin: 0;"><a href="mailto:support@nonrml.com" style="color: #000000; text-decoration: none; font-weight: 500;">support@nonrml.com</a></p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

// Order Quantity Update Email Template
export const generateOrderQuantityUpdateEmail = (orderId: string, orderIdVarChar: string): string => {
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Order Update</title>
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
                        <h2 style="margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Order Update Notice</h2>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Dear Customer,</p>
                        <p style="margin: 1px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Your order ORD-${escapeHtml(orderId)}${escapeHtml(orderIdVarChar)} has been updated by our team due to unavailability of some products. The respective amount for unavailable items will be refunded within 5-7 working days.</p>
                        <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">We apologize for any inconvenience caused and appreciate your understanding.</p>
                        <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Best regards,<br />NoNRML Team</p>
                        
                        <!-- View Order Button -->
                        <div style="margin: 25px 0;">
                            <a href="www.nonorml.com/orders/${escapeHtml(orderId)}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 6px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; transition: background-color 0.2s;">View your order</a>
                            <span style="margin: 0 10px; color: #9ca3af;">or</span>
                            <a href="www.nonorml.com" style="color: #000000; text-decoration: none; font-size: 12px; font-weight: 500;">Visit our store</a>
                        </div>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 30px; text-align: center; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; background-color: #ffffff; border-top: 1px solid #000000;">
                        <p style="margin: 0 0 10px; color: #4a5568; font-weight: 400;">Questions about your order? Please contact our customer service team:</p>
                        <p style="margin: 0;"><a href="mailto:support@nonrml.com" style="color: #000000; text-decoration: none; font-weight: 500;">support@nonrml.com</a></p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};