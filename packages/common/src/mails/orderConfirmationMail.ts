import { OrderConfirmationData, Product } from "./types";
import { logoSrc, escapeHtml, formatCurrency } from "./helper"

export const generateOrderConfirmationEmail = (options: OrderConfirmationData): string => {
    // Default values merged with provided options
    const data: OrderConfirmationData = {
        customerName: options.customerName,
        customerNumber: options.customerNumber,
        orderId: options.orderId,
        orderDate: options.orderDate,
        products: options.products,
        credit: options.credit,
        total: options.total,
        shippingAddress: options.shippingAddress,
        paymentMethod: options.paymentMethod,
    };
    console.log(data);

    // Generate product rows with images
    const productRows: string = data.products.map((product: Product) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 20px 0; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${product.image ? `
                        <img src="${escapeHtml(product.image)}" 
                             alt="${escapeHtml(product.sku)}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e5e5;">
                    ` : `
                        <div style="width: 60px; height: 60px; background-color: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">
                            No Image
                        </div>
                    `}
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 12px;">${escapeHtml(product.sku)}</p>
                        ${product.size ? `<p style="margin: 5px 0 0; font-size: 12px; color: #666; font-weight: 400;">Size: ${escapeHtml(product.size)}</p>` : ''}
                    </div>
                </div>
            </td>
            <td style="padding: 20px 10px; font-size: 12px; text-align: center; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500;">${product.quantity}</td>
            <td style="padding: 20px 0; font-size: 12px; text-align: right; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; color: #1a1a1a;">${formatCurrency(product.price)}</td>
        </tr>
    `).join('');

    // Generate the complete HTML email
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Order Confirmation</title>
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
                        <h2 style="margin: 0 0 5px; font-size: 16px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Fact Check: You have great taste in fashion!</h2>
                        <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Dear ${escapeHtml(data.customerName)},</p>
                        <p style="margin: 1px 0 0; font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">Thank you for your order. We are pleased to confirm that your purchase has been approved and is being processed with care</p>
                        
                        <!-- View Order Button -->
                        <div style="margin: 25px 0;">
                            <a href="www.nonorml.com/orders/${data.orderId}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; border-radius: 6px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; transition: background-color 0.2s;">View your order</a>
                            <span style="margin: 0 10px; color: #9ca3af;">or</span>
                            <a href="www.nonorml.com" style="color: #000000; text-decoration: none; font-size: 12px; font-weight: 500;">Visit our store</a>
                        </div>
                    </td>
                </tr>
                
                <!-- Order Summary -->
                <tr>
                    <td style="padding: 0 30px 30px;">
                        <div style=" border-radius: 8px; padding: 25px; border: 1px solid #000000;">
                            <h3 style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Order summary</h3>
                            <p style="margin: 0 0 3px; font-size: 12px; color: #6b7280; font-weight: 500;">Order : ${escapeHtml(data.orderId)}</p>
                            <p style="margin: 0 0 20px; font-size: 12px; color: #6b7280; font-weight: 500;">Order Date : ${escapeHtml(data.orderDate)}</p>
                            
                            <!-- Product Details -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5;">
                                
                                <!-- Product Rows -->
                                ${productRows}
                                
                                <!-- Pricing Summary -->
                                <tr style="background-color: #f2f2f2;">
                                    <td colspan="2" style="padding: 15px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500; color: #4a5568;">Subtotal</td>
                                    <td style="padding: 15px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 600; color: #1a1a1a;">${formatCurrency(data.total + data.credit)}</td>
                                </tr>
                                <tr style="background-color: #f2f2f2;">
                                    <td colspan="2" style="padding: 8px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500; color: #4a5568;">Shipping</td>
                                    <td style="padding: 8px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500; color: #16a34a;">₹0</td>
                                </tr>
                                ${data.credit > 0 ? `
                                <tr style="background-color: #f2f2f2;">
                                    <td colspan="2" style="padding: 8px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500; color: #4a5568;">Credit Applied</td>
                                    <td style="padding: 8px 20px; text-align: right; font-size: 12px; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-weight: 500; color: #dc2626;">-${formatCurrency(data.credit)}</td>
                                </tr>
                                ` : ''}
                                <tr style="background-color: #ffffff; border-top: 2px solid #e5e5e5;">
                                    <td colspan="2" style="padding: 15px 20px; text-align: right; font-size: 12px; font-weight: 700; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a;">Total</td>
                                    <td style="padding: 15px 20px; text-align: right; font-size: 12px; font-weight: 700; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a;">${formatCurrency(data.total)}</td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
                
                <!-- Customer Information -->
                <tr>
                    <td style="padding: 0 30px 40px;">
                        <h3 style="margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Customer information</h3>
                        
                        <div style="display: flex; gap: 30px;">
                            <!-- Shipping Address -->
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 10px; font-size: 12px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Shipping address</h4>
                                <div style="font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.name)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.customerNumber)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.street)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zip)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.country)}</p>
                                </div>
                                <h4 style="margin: 20px 0 10px; font-size: 12px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Payment method</h4>
                                <p style="margin: 0; font-size: 12px; color: #4a5568; font-weight: 400;">${escapeHtml(data.paymentMethod)}</p>
                            </div>
                            
                            <!-- Billing Address -->
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 10px; font-size: 12px; font-weight: 600; color: #1a1a1a; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;">Billing address</h4>
                                <div style="font-size: 12px; line-height: 1.6; color: #4a5568; font-weight: 400;">
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.name)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.customerNumber)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.street)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zip)}</p>
                                    <p style="margin: 0;">${escapeHtml(data.shippingAddress.country)}</p>
                                </div>
                            </div>
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