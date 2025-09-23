import { escapeHtml, logoSrc, formatCurrency } from "./helper";
import { RefundNotificationData } from "./types";

export const generateRefundNotificationEmail = (options: RefundNotificationData): string => {
    const data = options;
    const totalRefund = data.bankRefundAmount + (data.creditNoteAmount ?? 0);
    const hasCreditNote = data.creditNoteId && data.creditNoteAmount;

    // Generate the complete HTML email
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Refund Notification</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #000000; background-color: #ffffff; line-height: 1.4;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse;">
                
                <!-- Header -->
                <tr>
                    <td style="padding: 60px 40px 40px;">
                        <img src="${logoSrc}" alt="NoNRML" style="height: 40px;">
                    </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                    <td style="padding: 0 40px;">
                        <h1 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #000000;">Refund Processed</h1>
                        <p style="margin: 0 0 20px; font-size: 12px; color: #666666; font-weight: 400; line-height: 1.6;">
                            Due to unavailability of some item(s) in your order <strong>ORD-${escapeHtml(data.orderId)}${escapeHtml(data.orderIdVarChar)}</strong>, we have processed a refund for you.
                        </p>
                    </td>
                </tr>
                
                <!-- Refund Details -->
                <tr>
                    <td style="padding: 0 40px 30px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                            <tr>
                                <td colspan="2" style="padding: 20px 0 16px; border-top: 1px solid #f0f0f0;">
                                    <p style="margin: 0; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">REFUND BREAKDOWN</p>
                                </td>
                            </tr>
                            
                            <!-- Bank Refund -->
                            <tr>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">Bank Refund</p>
                                    <p style="margin: 2px 0 0; font-size: 11px; color: #666666;">5-7 business days</p>
                                </td>
                                <td style="padding: 8px 0; text-align: right;">
                                    <p style="margin: 0; font-size: 14px; color: #000000; font-weight: 500;">${formatCurrency(data.bankRefundAmount)}</p>
                                </td>
                            </tr>
                            
                            ${hasCreditNote ? `
                            <!-- Credit Note -->
                            <tr>
                                <td style="padding: 8px 0;">
                                    <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">Store Credit</p>
                                    <p style="margin: 2px 0 0; font-size: 11px; color: #666666;">Code: ${escapeHtml(data.creditNoteId!)}</p>
                                </td>
                                <td style="padding: 8px 0; text-align: right;">
                                    <p style="margin: 0; font-size: 14px; color: #000000; font-weight: 500;">${formatCurrency(data.creditNoteAmount!)}</p>
                                </td>
                            </tr>
                            ` : ''}
                            
                            <!-- Total -->
                            <tr>
                                <td style="padding: 16px 0 8px; border-top: 1px solid #f0f0f0;">
                                    <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 600; text-transform: uppercase;">Total Refund</p>
                                </td>
                                <td style="padding: 16px 0 8px; text-align: right; border-top: 1px solid #f0f0f0;">
                                    <p style="margin: 0; font-size: 16px; color: #000000; font-weight: 600;">${formatCurrency(totalRefund)}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                
                ${hasCreditNote ? `
                <!-- Credit Note Info Box -->
                <tr>
                    <td style="padding: 0 40px 40px;">
                        <div style="border: 1px solid #666666; border-radius: 3px; padding: 16px;">
                            <p style="margin: 0 0 8px; font-size: 11px; color: #000000; font-weight: 600; text-transform: uppercase;">Store Credit Details</p>
                            <p style="margin: 0 0 4px; font-size: 12px; color: #000000;">
                                Credit Code: <strong>${escapeHtml(data.creditNoteId!)}</strong>
                            </p>
                            <p style="margin: 0 0 4px; font-size: 12px; color: #000000;">
                                Valid Until: <strong>${ data.creditNoteExpiry ? escapeHtml(new Date(data.creditNoteExpiry).toDateString()) : "Remains same"}</strong>
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #666666; font-style: italic;">
                                Use this code at checkout for your next purchase
                            </p>
                        </div>
                    </td>
                </tr>
                ` : ''}
                
                <!-- Action Buttons -->
                <tr>
                    <td style="padding: ${hasCreditNote ? '0' : '20px'} 40px 60px; text-align: center;">
                        <a href="https://www.nonrml.co.in/orders/ORD-${escapeHtml(data.orderId)}${escapeHtml(data.orderIdVarChar)}" style="display: inline-block; padding: 10px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; border: none; margin-right: 10px;">View Order</a>
                        <a href="https://www.nonrml.co.in" style="display: inline-block; padding: 10px 24px; background-color: #ffffff; color: #000000; text-decoration: none; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid #000000;">Continue Shopping</a>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                        <p style="margin: 0 0 8px; font-size: 11px; color: #999999; font-weight: 300;">Questions about your refund?</p>
                        <p style="margin: 0;">
                            <a href="mailto:${process.env.CLIENT_SUPPORT_MAIL}" style="color: #000000; text-decoration: none; font-size: 11px; font-weight: 400;">${process.env.CLIENT_SUPPORT_MAIL}</a>
                        </p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};