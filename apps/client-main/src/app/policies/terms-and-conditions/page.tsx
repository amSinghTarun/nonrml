// app/terms-and-conditions/page.tsx
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `Terms And Condition - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
  keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

export default function TermsAndConditions() {
  return (
    <section className="flex min-h-screen w-screen flex-row text-black justify-center items-start bg-white pt-20 pb-10 mb-64">
      <article className="w-[90%] max-w-4xl flex flex-col">
        <h1 className="flex text-black justify-center text-lg font-bold mb-10">
          TERMS & CONDITIONS
        </h1>
        
        <div className="text-xs space-y-8 text-black">
          <div>
            <h2 className="font-semibold mb-2">1. Introduction</h2>
            <p>
              Welcome to www.nonrml.com ("Website"). This website is operated by NoNrml. Throughout the site, the terms "we," "us," and "our" refer to NoNrml. By accessing or using our Website, you agree to comply with and be bound by the following terms and conditions ("Terms"). Please read them carefully before using our Website.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">2. Use of the Website</h2>
            <ul className="space-y-2">
              <li>• You must be at least 14 years of age to use this website. By accessing and using this website, you represent that you are at least 14 years old.</li>
              <li>• You agree to use this Website solely for lawful purposes and in a manner that does not infringe the rights of or restrict the use of this website by others.</li>
              <li>• You may not use our products for any illegal or unauthorized activities.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">3. Intellectual Property</h2>
            <ul className="space-y-2">
              <li>• All content on this website, including but not limited to text, graphics, logos, images, and software, is the exclusive property of NoNrml and is protected by intellectual property laws.</li>
              <li>• You are not permitted to reproduce, distribute, or create derivative works from any content on this Website without explicit written consent from us.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">4. Product Information</h2>
            <ul className="space-y-2">
              <li>• We make every effort to display the colours and details of our products as accurately as possible. However, we cannot guarantee that the colours and details will appear perfectly due to differences in display devices.</li>
              <li>• If you spot a detail in the product design that wasn't visible in the website photos, know that it's an intentional part of our unique craftsmanship—because true art lies in the details.</li>
              <li>• We reserve the right to limit the quantities of products or services we offer. All product descriptions and pricing are subject to change without prior notice.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">5. Orders and Payments</h2>
            <ul className="space-y-2">
              <li>• When placing an order on our Website, you agree to provide accurate and up-to-date purchase and account details.</li>
              <li>• All payments must be made at the time of purchase, and payments are non-refundable unless otherwise indicated.</li>
              <li>• All prepaid orders are automatically confirmed once payment is received. However, for orders placed with the Cash on Delivery (COD) option, we may reach out to you for confirmation before processing your order.</li>
              <li>• Our inventory is updated once the payment is successfully completed. In the rare situation where two customers simultaneously attempt to purchase the last remaining item, and both proceed with the payment process, the order of the customer whose payment is processed first will be fulfilled.</li>
              <li>• You will receive an automatic confirmation email once your order has been successfully placed. If you do not see the order confirmation in your inbox within a few minutes, please check your spam or junk email folder.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">5. Orders Cancellation</h2>
            <ul className="space-y-2">
              <li>• Cancellation of orders are only permitted on COD orders which will be possible if and till the order has not been accepted</li> 
              <li>• All prepaid orders are final. We do not offer any cancellations and refunds. Any refunds are issued in the form of gift cards equivalent to the selling/MRP amount, which can be used within 6 (six) months. gift cards are non-refundable; and are only redeemable at our offline and online store. Shipping charges are non-refundable.</li>
              <li>• We reserve the right to reject any order at our discretion. If we need to modify or cancel your order, we will inform you via a different medium using the contact details provided by you.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">6. Shipping and Delivery</h2>
            <ul className="space-y-2">
              <li>• Shipping costs and delivery times may vary depending on your location and the shipping, payment option you select.</li>
              <li>• While we take every measure to ensure your order is dispatched promptly, we cannot be held responsible for any delays or damages that may occur during the shipping process. Once the package is handed over to the courier, it is subject to their handling and timelines.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">7. Returns and Refunds</h2>
            <ul className="space-y-2">
              <li>• Please review our Return & Exchange Policy mentioned below in the Return, Exchange section.</li>
              <li>• All sales are final unless otherwise mentioned in our Return Policy.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">8. Limitation of Liability</h2>
            <ul className="space-y-2">
              <li>• NoNrml will not be held liable for any damage resulting from your use of this website or the products purchased through the Website.</li>
              <li>• In no case will our liability exceed the amount you paid for the product.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">9. Changes to Terms</h2>
            <p>
              We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Website after any changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">10. Governing Law</h2>
            <p>
              These Terms, along with any agreements through which we provide services, will be governed by and construed in accordance with the laws of India.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Shipping Times</h2>
            <ul className="space-y-2">
              <li>• Orders are typically processed within 1-2 business days.</li>
              <li>• Standard shipping times may vary depending on your location, but generally range from 5-7 business days.</li>
              <li>• Please note that shipping delays may occur during certain times of the year, such as festivals, holidays, or markdown periods, when courier services experience higher-than-usual volumes. We appreciate your understanding and patience during these times.</li>
              <li>• Please note that once proof of delivery is attached to a tracking number, NoNrml is not responsible for lost, damaged, or stolen items. All risks are assumed by the courier.</li>
            </ul>
          </div>
        </div>
      </article>
    </section>
  );
}