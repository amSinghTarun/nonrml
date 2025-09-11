// app/return-exchange-policy/page.tsx
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `Return And Exchange - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
  keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

export default function ReturnExchangePolicy() {
  return (
    <section className="flex min-h-screen w-screen flex-row text-black justify-center items-start bg-white pt-20 mb-64 pb-10">
      <article className="w-[90%] max-w-4xl flex flex-col">
        <h1 className="flex text-black justify-center text-lg font-bold mb-10">
          REFUND & EXCHANGE POLICY
        </h1>
        
        <div className="text-xs text-center mb-8 text-black">
          <p>
            At NONRML, we aim to provide a smooth and efficient Refund & Exchange process for all our customers.
          </p>
        </div>

        <div className="text-xs space-y-8 text-black">
          <div>
            <h2 className="font-semibold mb-2">Return/Exchange Instructions</h2>
            <ol className="space-y-4">
              <li>1. We offer a return window of 3 days and an exchange window of 5 days from the date of delivery. Additionally, we provide free exchanges up to one time only.</li>
              <li>2. Please note that once a product has been exchanged, It is not eligible for return or exchange. We recommend ensuring that your selection is accurate when opting for an exchange.</li>
              <li>3. In the event that a return, if pickup service is not available at your provided pincode, you will be responsible for shipping the product back to us. Please send the item to the address mentioned on the return label or the provided communication. Make sure to keep proof of shipment for reference</li>
              <li>4. We reserve the right to reject your return/exchange request for any reason related to quality check (QC). You cannot question, argue, or take any legal action against our decision.</li>
              <li>5. Exchange depends on stock availability. If the requested size is unavailable, you will receive company credit, valid for 6 months. You can use it for your next purchase or at the same time.</li>
              <li>6. Once your exchange/return request is accepted by our team, you will receive a notification via your registered email. Our logistics partner will arrange for the order to be picked up within 24-48 hours.</li>
              <li>7. Pickup attempts will be made twice. If the courier partner is unable to collect the package after two attempts, you will be responsible for shipping the product back to our warehouse. Please note, reverse pickup is dependent on service availability in your area based on the pincode.</li>
              <li>8. Upon receipt of the returned product at our warehouse, it will undergo a thorough Quality Check. Once approved, we will proceed with processing your exchange/return request. You will be notified once your return is received and inspected.
                <div className="mt-4 space-y-4">
                  <div className="pl-4">
                    <p className="font-semibold">Option-1</p>
                    <p>If approved, your refund will be issued to your original payment method within 10 business days. Please be aware that it may take additional time for your bank or credit card provider to process and post the refund.</p>
                  </div>
                  <div className="pl-4">
                    <p className="font-semibold">Option-2</p>
                    <p>Once your returned product is processed and approved, you will receive a credit note instead of a monetary refund. The credit note will be worth the exact amount of your returned item and can be used for your next purchase. Only one credit note can be applied per order. The credit note code will be sent to you via email, and it is your responsibility to keep it safe. Once issued, we are not responsible for any loss or misuse of the credit note.</p>
                    <p className="mt-2">The credit note is transferable, meaning you can share it with others. If you don't wish to use it, you can give it to a friend or family member, and they can redeem it for their purchase on our website.</p>
                  </div>
                </div>
              </li>
              <li>9. The estimated delivery time for all exchange requests is between 7-10 business days.</li>
              <li>10. Please ensure the product(s) are returned in the same condition as when they were shipped. Returns in poor condition or with signs of wear will not be accepted, and the query will not be processed further.</li>
              <li>11. If you encounter any further issues, please contact us via email at <span className="cursor-pointer text-rose-400">support@nonrml.com</span>, including your name and order ID. Our support team is available Monday to Saturday from 11:00 AM to 6:00 PM. All pending inquiries will be prioritized and resolved within 48 hours.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Terms & Conditions</h2>
            <p className="mb-4">You may initiate the request of an exchange/return of a product if:</p>
            <ul className="space-y-2 mb-6">
              <li>• Product does not fit</li>
              <li>• Both the product and shipping package have been damaged</li>
              <li>• Product is defective</li>
              <li>• Parts of the Product or accessory is missing</li>
            </ul>

            <p className="mb-4">
              You may return or exchange products purchased from us, provided they meet the following mandatory conditions:
            </p>
            <ul className="space-y-2">
              <li>• The product has not been worn, cleaned, or tampered with by you.</li>
              <li>• Brand tags, original packaging, and any accompanying accessories must remain intact, unaltered, undamaged, and not discarded.</li>
              <li>• The product has not been altered, except in cases of proven vendor defects.</li>
              <li>• The return request corresponds to the original order, and the product matches the records we hold.</li>
              <li>• The product is free from any foul Odors, perfume, stains, dents, scratches, tears, or other forms of damage.</li>
              <li>• If purchased as part of a set, the entire set must be returned or exchanged.</li>
              <li>• Returned products must be in unused, undamaged, unwashed, and saleable condition.</li>
              <li>• We must be satisfied that the product has not been rendered defective or unusable.</li>
              <li>• The return process is facilitated through our reverse logistics partners. Once a return request is submitted and acknowledged by us, our partners will coordinate with you to collect the products.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Customer Support</h2>
            <p>
              Any queries or concerns relating to the return and cancellation may be directed by you to our customer support team who can be contacted at 
              <span className="cursor-pointer text-rose-400 ml-1">info@nonrml.co.in</span>
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}