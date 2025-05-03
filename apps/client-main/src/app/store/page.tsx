import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";

export async function generateMetadata() {
    const { data: products } = await (await serverClient()).viewer.product.getProducts({});
    
    return {
      // Basic metadata fields
      title: 'Premium T-shirts - Unisex Streetwear T-shirts Online - NoNRML',  // Browser tab title, search engine title
      description: `Buy Premium Unisex Streetwear Oversize T-shirt online from NoNRML `,  // Meta description for SEO
      keywords: ["premium t-shirt", "t-shirt", "oversize t-shirt", "Streetwear", "streetwear t-shirts", "unisex t-shirts"],
      robots: 'index, follow',
      // OpenGraph metadata (for social sharing - Facebook, LinkedIn, etc.)
      openGraph: {
        title: 'Premium T-shirts - Unisex Streetwear T-shirts Online - NoNRML',  // Title when shared on social media
        description: `Premium T-shirts `,  // Description when shared
        type: 'website',  // Content type (website, article, video, etc.)
        url: '/store',  // Canonical URL of the page
        images: products.length > 0 && products[0]?.productImages[0].image ? [
          {
            url: products[0].productImages[0].image,  // Image URL to display when shared
            width: 1200,  // Recommended width for social previews
            height: 630,  // Recommended height (1.91:1 ratio)
            alt: 'Store featured product'  // Alt text for accessibility
          }
        ] : undefined
      }
    };
}

const StorePage = async () => {
    const { data: products, nextCursor } = await (await serverClient()).viewer.product.getProducts({cursor: undefined});

    return (
        <section className="pt-14 z-30 flex-col min-h-screen h-auto w-screen flex bg-white mb-60 lg:mb-24">
            <Products products={products} nextCursor={nextCursor}></Products>
        </section>
    )
}

export default StorePage;
