export const generateProductSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "YourBrandName",
        "description": "Sustainable and ethically made clothing for modern wardrobes. Featuring timeless designs crafted from premium eco-friendly materials.",
        "url": "https://yourbrand.com",
        "logo": "https://yourbrand.com/images/logo.png",
        "sameAs": [
          "https://instagram.com/yourbrand",
          "https://facebook.com/yourbrand",
          "https://pinterest.com/yourbrand"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-123-4567",
          "contactType": "customer service",
          "availableLanguage": ["English"]
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://yourbrand.com/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "slogan": "Sustainable Fashion, Timeless Style",
        "keywords": "ethical clothing, sustainable fashion, eco-friendly apparel, size-inclusive fashion, organic cotton clothing, affordable luxury, capsule wardrobe essentials"
      }
};


// add below on homepage
// {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     "name": "YourBrandName - Sustainable Fashion & Ethical Clothing",
//     "url": "https://yourbrand.com",
//     "description": "Shop our collection of ethically made, sustainable clothing for men and women. Free shipping on orders over $50.",
//     "potentialAction": {
//       "@type": "SearchAction",
//       "target": {
//         "@type": "EntryPoint",
//         "urlTemplate": "https://yourbrand.com/search?q={search_term_string}"
//       },
//       "query-input": "required name=search_term_string"
//     }
//   }