import { CreditNoteData } from "./types";
import { escapeHtml, logoSrc, formatCurrency  } from "./helper";

export const generateCreditNoteEmail = (options: CreditNoteData): string => {
    const data = options;

    // Generate the complete HTML email
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Credit Note</title>
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
                        <p style="margin: 0 0 30px; font-size: 12px; color: #999999; font-weight: 400;">Dear NoNRML member, a credit note has been issued to your account.</p>

                        <h1 style="margin: 0 0 2px; font-size: 12px; font-weight: 500; color: #999999; letter-spacing: 0.02em;">CREDIT NOTE</h1>
                        <p style="margin: 0 0 30px; font-size: 18px; color: #000000; text-transform: uppercase; ">${escapeHtml(data.creditNoteId)}</p>
                        
                    </td>
                </tr>
                
                <!-- Credit Details -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse;">
                                ${ data.originalOrderNumber != "" && `<tr>
                                    <td style="padding: 8px 0 4px;">
                                        <p style="margin: 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 400;">Order</p>
                                    </td>
                                    <td style="padding: 8px 0 4px; text-align: right;">
                                        <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">${escapeHtml(data.originalOrderNumber)}</p>
                                    </td>
                                </tr>`}
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 400;">Account</p>
                                    </td>
                                    <td style="padding: 4px 0; text-align: right;">
                                        <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">${escapeHtml(data.customerMobile)}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 400;">Expiry</p>
                                    </td>
                                    <td style="padding: 4px 0; text-align: right;">
                                        <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">${escapeHtml(new Date(data.creditNoteExpiry).toDateString())}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 11px; color: #000000; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 400;">${escapeHtml(data.creditNoteId)}</p>
                                    </td>
                                    <td style="padding: 4px 0; text-align: right;">
                                        <p style="margin: 0; font-size: 12px; color: #000000; font-weight: 400;">${formatCurrency(data.creditAmount)}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                
                <!-- View Account Button -->
                <tr>
                    <td style="padding: 0 40px 60px; text-align: center;">
                        <a href="https://www.nonrml.co.in/orders" style="display: inline-block; padding: 10px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; border: none;">View Account</a>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                        <p style="margin: 0 0 8px; font-size: 11px; color: #999999; font-weight: 300;">Questions?</p>
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