import { logoSrc, escapeHtml } from "./helper";
import { ShippingNotificationData } from "./types";

export const generateReplacementConfirmationEmail = (orderId: string): string => {
    
    const data = {
        orderId: orderId
    };

    // Generate the complete HTML email
    return `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Replacement Request Received</title>
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
                        <h2 style="margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Replacement Request Confirmed</h2>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Dear Customer,</p>
                        <p style="margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">We have received your replacement request for order ${escapeHtml(data.orderId)}. Here's what happens next:</p>
                        
                        <!-- Process Timeline -->
                        <div style="margin: 25px 0; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                            <h3 style="margin: 0 0 15px; font-size: 14px; font-weight: 600; color: #1a1a1a;">Replacement Process</h3>
                            
                            <!-- Step 1 -->
                            <div style="margin-bottom: 15px; display: flex; align-items: flex-start;">
                                <div style="width: 28px; height: 28px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0;">1</div>
                                <div style="margin-left: 12px;">
                                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #1a1a1a;">Pickup Scheduled</p>
                                    <p style="margin: 2px 0 0; font-size: 11px; color: #6b7280;">Our delivery partner will collect the package from your address</p>
                                </div>
                            </div>
                            
                            <!-- Step 2 -->
                            <div style="margin-bottom: 15px; display: flex; align-items: flex-start;">
                                <div style="width: 28px; height: 28px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0;">2</div>
                                <div style="margin-left: 12px;">
                                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #1a1a1a;">Quality Check</p>
                                    <p style="margin: 2px 0 0; font-size: 11px; color: #6b7280;">We'll inspect the returned item to ensure it's intact and meets our QC standards</p>
                                </div>
                            </div>
                            
                            <!-- Step 3 -->
                            <div style="display: flex; align-items: flex-start;">
                                <div style="width: 28px; height: 28px; background-color: #000000; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0;">3</div>
                                <div style="margin-left: 12px;">
                                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #1a1a1a;">Ship Replacement</p>
                                    <p style="margin: 2px 0 0; font-size: 11px; color: #6b7280;">Once QC is passed, we'll ship your new product and notify you immediately</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Track Replacement Button -->
                        <div style="margin: 25px 0; text-align: center;">
                            <a href="www.nonorml.com/exchanges/${escapeHtml(data.orderId)}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 6px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; transition: background-color 0.2s;">Track Replacement Status</a>
                        </div>
                        
                        <!-- Info Box -->
                        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-top: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #0369a1; line-height: 1.6;">
                                <strong>Important:</strong> You can check the QC results and track your replacement progress on the replacement page. We'll update you at each step of the process.
                            </p>
                        </div>
                        
                        <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Thank you for your patience and understanding.</p>
                        <p style="margin: 15px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Best regards,<br />NoNRML Team</p>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 30px; text-align: center; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; background-color: #ffffff; border-top: 1px solid #000000;">
                        <p style="margin: 0 0 10px; color: #4a5568; font-weight: 400;">Questions about your replacement? Please contact our customer service team:</p>
                        <p style="margin: 0;"><a href="mailto:support@nonrml.com" style="color: #000000; text-decoration: none; font-weight: 500;">support@nonrml.com</a></p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};