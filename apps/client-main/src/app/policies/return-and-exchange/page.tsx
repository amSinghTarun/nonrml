// app/return-exchange-policy/page.tsx
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy - NoNRML | Refund & Exchange Terms',
  description: 'NoNRML offers a 5-day exchange window from delivery. Learn about our return and exchange policy, credit notes, refund process, and terms for damaged products. Shop with confidence.',
  keywords: ['NoNRML returns', 'exchange policy', 'refund policy', 'return process', 'credit note', 'damaged product return', 'exchange terms India', 'streetwear returns', '5 day exchange'],
  openGraph: {
    title: 'Return & Exchange Policy - NoNRML',
    description: '5-day exchange window. Learn about our refund and exchange process for NoNRML products.',
    url: 'https://www.nonrml.co.in/policies/return-and-exchange',
    type: 'website',
    locale: 'en_IN',
    siteName: 'NoNRML',
  },
  twitter: {
    card: 'summary',
    title: 'Return & Exchange Policy - NoNRML',
    description: '5-day exchange window and refund terms.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.nonrml.co.in/policies/return-and-exchange',
  },
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
              <li>1. We offer an exchange window of 5 days from the date of delivery. Please note that we currently do not provide returns, only exchanges are available. Returns will only be accepted in the case of damaged products, and such requests must be raised within 24 hours of delivery. To process a return for a damaged item, an unboxing video is mandatory. The video must clearly show the full unboxing process, including all product details, to verify the damage.</li>
              
              <li>2. Please note that once a product has been exchanged, it is no longer eligible for a second exchange. We kindly recommend verifying your selection carefully before proceeding with an exchange request.</li>
              
              <li>3. In the event that a return, if pickup service is not available at your provided pincode, you will be responsible for shipping the product back to us. Please send the item to the address mentioned on the return label or the provided communication. Make sure to keep proof of shipment for reference.</li>
              
              <li>4. We reserve the right to reject your return/exchange request for any reason related to quality check (QC). You cannot question, argue, or take any legal action against our decision.</li>
              
              <li>5. Once your exchange/return request is accepted by our team, you will receive a notification via your registered email. Our logistics partner will arrange for the order to be picked up within 24-48 hours.</li>
              
              <li>6. Pickup attempts will be made twice. If the courier partner is unable to collect the package after two attempts, you will be responsible for shipping the product back to our warehouse. Please note, reverse pickup is dependent on service availability in your area based on the pincode.</li>
              
              <li>7. Upon receipt of the returned product at our warehouse, it will undergo a thorough Quality Check. Once approved, we will proceed with processing your exchange/return request. You will be notified once your return is received and inspected.</li>
              
              <li>8. The estimated delivery time for all exchange requests is between 7-10 business days.</li>
              
              <li>9. Please ensure the product(s) are returned in the same condition as when they were shipped. Returns in poor condition or with signs of wear will not be accepted, and the query will not be processed further.</li>
              
              <li>10. If you encounter any further issues, please contact us via email at <span className="cursor-pointer text-rose-400">support@nonrml.co.in</span> including your name and order ID. Our support team is available Monday to Saturday from 11:00 AM to 6:00 PM. All pending inquiries will be prioritized and resolved within 48 hours.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Exchange and Return Policy – Based on Stock Availability</h2>
            <p className="mb-4">
              Exchange or return is subject to stock availability. If the requested size or item is unavailable, you will have the option to receive either:
            </p>
            <ul className="space-y-2 mb-6">
              <li>• Credit Note (Credit Note)</li>
              <li>• A Refund to your original payment method (equal to the value of the unavailable product)</li>
            </ul>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Credit Note Terms:</h3>
              <ul className="space-y-2">
                <li>• The credit note will be valid for 6 months from the date of issuance.</li>
                <li>• You can use it either immediately or for a future purchase.</li>
                <li>• The credit note code will be sent to your registered email, and it is your responsibility to keep it secure.</li>
                <li>• Once issued, we are not liable for any loss or misuse of the credit note.</li>
                <li>• The credit note will be equal to the exact value of your returned product.</li>
                <li>• Only one credit note can be applied per order.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Transferable Credit Note:</h3>
              <p>
                The credit note is not limited to the original purchaser. You are free to share it with a friend or family member, who may redeem it on our website during their purchase.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Terms & Conditions</h2>
            <p className="mb-4">You may initiate the request of an exchange of a product if:</p>
            <ul className="space-y-2 mb-6">
              <li>• Product does not fit</li>
              <li>• Both the product and shipping package have been damaged</li>
              <li>• Product is defective</li>
              <li>• Parts of the Product or accessory is missing</li>
            </ul>

            <p className="mb-4">
              You may exchange products purchased from us, provided they meet the following mandatory conditions:
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
              <li>• The exchange process is facilitated through our reverse logistics partners. Once a exchange request is submitted and acknowledged by us, our partners will coordinate with you to collect the products.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Customer Support</h2>
            <p>
              Any queries or concerns relating to the return and cancellation may be directed by you to our customer support team who can be contacted at-
            </p>
            <p className="mt-2">
              Write to us at <span className="cursor-pointer text-rose-400">support@nonrml.co.in</span>
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}