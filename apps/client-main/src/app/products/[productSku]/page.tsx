import { RouterOutput } from "@/app/_trpc/client";
import { serverClient } from "@/app/_trpc/serverClient";
import Loading from "@/app/loading";
import Product from "@/components/Product";

type Props = {
    params: Promise<{ productSku: string }> 
}

export async function generateMetadata({ params }: Props) {
    const { data } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
    const productSKU = (await params).productSku;
    
    return {
      // Basic metadata fields
      title: `${productSKU} - Premiun Unisex Streetwear ${data.product.category} - NoNRML`,  // Browser tab title, search engine title
      description: `Buy Premium Unisex Streetwear Oversize ${productSKU} ${data.product.category} online from NoNRML `,  // Meta description for SEO
      keywords: ["premium ${productSKU}", "${productSKU}", "oversize ${productSKU}", "Streetwear", "streetwear ${productSKU}", "unisex ${productSKU}"],
      robots: `index, follow`,
      // OpenGraph metadata (for social sharing - Facebook, LinkedIn, etc.)
      openGraph: {
        title: `Premium ${productSKU} - Unisex Streetwear ${productSKU} Online - NoNRML`,  // Title when shared on social media
        description: `Premium ${productSKU} `,  // Description when shared
        type: `website`,  // Content type (website, article, video, etc.)
        url: `/store/${productSKU}`,  // Canonical URL of the page
        images: data.product.productImages && data.product.productImages[0].image ? [
          {
            url: data.product.productImages[0].image,  // Image URL to display when shared
            width: 1200,  // Recommended width for social previews
            height: 630,  // Recommended height (1.91:1 ratio)
            alt: `Store featured product`  // Alt text for accessibility
          }
        ] : undefined
      }
    };
}


const ProductPage = async ({ params }: Props)=> {

    const { data } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
 
    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-y-scroll overscroll-none flex bg-white mb-64 lg:mb-32 scrollbar-hide">
            <Product product={data.product} productSizeQuantities={data.productSizeQuantities}></Product> 
        </section>
    )
}

export default ProductPage;
