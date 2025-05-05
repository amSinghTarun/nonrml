export const generateProductSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do your sizes run compared to other brands?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our sizes generally run true to standard measurements. For most accurate sizing, please refer to our detailed size chart which provides measurements for each garment. We offer sizes XS-3XL to accommodate a wide range of body types."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best way to wash and care for organic cotton clothing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For organic cotton items, we recommend machine washing in cold water with similar colors using mild, eco-friendly detergent. Tumble dry on low heat or line dry to minimize shrinkage and preserve fabric quality. Avoid bleach and fabric softeners to maintain the integrity of the organic fibers."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer international shipping and what are the delivery timeframes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we ship to over 40 countries worldwide. Domestic orders typically arrive within 3-5 business days, while international shipping takes 7-14 business days depending on the destination. All orders include tracking information, and we offer free shipping on orders over $100."
          }
        },
        {
          "@type": "Question",
          "name": "What is your return policy for online purchases?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer a 30-day hassle-free return policy for unworn items in original condition with tags attached. Return shipping is free for exchanges and store credit. For refunds to original payment method, a small return shipping fee applies unless the item was defective."
          }
        },
        {
          "@type": "Question",
          "name": "Are your clothes ethically manufactured and what certifications do you have?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All our garments are ethically manufactured in certified facilities that ensure fair wages and safe working conditions. We hold GOTS (Global Organic Textile Standard) certification for our organic items and are Fair Trade Certified. Our sustainability report is published annually on our website."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer installment payment options or buy now pay later services?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we partner with Afterpay, Klarna, and PayPal to offer flexible payment options. You can split your purchase into 4 interest-free payments at checkout with no impact on your credit score. We also accept all major credit cards, Apple Pay, and Google Pay."
          }
        }
      ]
    }
};