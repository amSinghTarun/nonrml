import { RouterOutput } from "@/app/_trpc/client";

type ProductSchemaProps = RouterOutput["viewer"]["product"]["getProduct"]["data"]

export const generateProductSchema = (product: ProductSchemaProps) => {
    return {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      "name": "Classic Black T-Shirt",
      "image": "https://example.com/images/black-tshirt.jpg",
      "description": "Premium cotton t-shirt with comfortable fit",
      "brand": {
        "@type": "Brand",
        "name": "YourBrand"
      },
      "variesBy": "size",
      "hasVariant": [
        {
          "@type": "Product",
          "name": "Classic Black T-Shirt - Small",
          "size": "S",
          "offers": {
            "@type": "Offer",
            "price": "29.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        },
        {
          "@type": "Product",
          "name": "Classic Black T-Shirt - Medium",
          "size": "M",
          "offers": {
            "@type": "Offer",
            "price": "29.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        },
        // Additional sizes...
      ]
    }
};