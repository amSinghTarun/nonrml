// app/privacy-policy/page.tsx
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic metadata fields
  title: `Privacy Policy - NoNRML`,  // Browser tab title, search engine title
  description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
  keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
  robots: 'index, follow',
}

export default function PrivacyPolicy() {
  return (
    <section className="flex min-h-screen w-screen flex-row text-black justify-center items-start bg-white pt-20 pb-10 mb-64">
      <article className="w-[90%] max-w-4xl flex flex-col">
        <h1 className="flex text-black justify-center font-bold text-lg mb-10">
          PRIVACY POLICY
        </h1>
        
        <div className="text-xs text-center mb-8 text-black">
          <p>
            At NONRML, ("we, us, our") are committed to protecting your personal information and ensuring its confidentiality. This Privacy Policy outlines how we collect, use, and protect your data when you interact with our website and services.
          </p>
        </div>

        <div className="text-xs space-y-8 text-black">
          <div>
            <h2 className="font-semibold mb-2">1. Information We Collect</h2>
            <p>
              We collect personal information when you interact with our website, including your name, email address, shipping address, payment information, and any other details necessary to complete a purchase or inquiry.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="mb-2">We use your personal information to:</p>
            <ul className="space-y-2">
              <li>• Process your orders and manage shipping.</li>
              <li>• Send order confirmations and updates.</li>
              <li>• Respond to your inquiries and provide customer support.</li>
              <li>• Offer promotional content and special offers, only if you've opted in.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">3. Data Security</h2>
            <p>
              We take the security of your information seriously. All transactions are processed through secure platforms, and your payment details are encrypted to ensure your privacy.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">4. Sharing Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal data to third parties. However, we may share it with trusted third-party service providers (such as shipping companies and payment gateways) to ensure smooth operations.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">5. Cookies & Tracking</h2>
            <p>
              We use cookies to improve your browsing experience and gather analytical data about site traffic. You can adjust your browser settings to refuse cookies if preferred.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">6. Your Rights</h2>
            <p>
              You can request access, correction, or deletion of your personal information at any time by contacting us at{' '}
              <span className="cursor-pointer text-rose-400">
                info@nonorml.com
              </span>.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}