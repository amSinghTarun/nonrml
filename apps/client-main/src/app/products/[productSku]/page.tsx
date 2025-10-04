import { serverClient } from "@/app/_trpc/serverClient";
import Product from "@/components/Product";

type Props = {
    params: Promise<{ productSku: string }> 
}

export async function generateMetadata({ params }: Props) {
  const { data } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
  const productSKU = (await params).productSku;
  return {
    // Basic metadata fields
    title: `${productSKU.replaceAll("-", " ").toUpperCase()} - Premiun Unisex Streetwear ${data.product.category.displayName?.replaceAll("_", " ")} - NoNRML`,  // Browser tab title, search engine title
    description: `Buy Premium Unisex Streetwear Oversize ${productSKU.replaceAll("_", " ").toUpperCase()} ${data.product.category.displayName?.replaceAll("_", " ")} online from NoNRML `,  // Meta description for SEO
    keywords: [`premium ${productSKU.replaceAll("-", " ").toUpperCase()}`, `${productSKU.replaceAll("-", " ").toUpperCase()}`, `oversize ${productSKU.replaceAll("-", " ").toUpperCase()}`, "Streetwear", `streetwear ${productSKU.replaceAll("-", " ").toUpperCase()}`, `unisex ${productSKU.replaceAll("-", " ").toUpperCase()}`],
    robots: `index, follow`,
    // OpenGraph metadata (for social sharing - Facebook, LinkedIn, etc.)
    openGraph: {
      title: `Premium ${productSKU.replaceAll("_", " ").toUpperCase()} - Unisex Streetwear ${productSKU.replaceAll("_", " ").toUpperCase()} Online - NoNRML`,  // Title when shared on social media
      description: `Premium ${productSKU.replaceAll("_", " ").toUpperCase()} `,  // Description when shared
      type: `website`,  // Content type (website, article, video, etc.)
      url: `/collections/${productSKU.replaceAll("_", " ").toUpperCase()}`,  // Canonical URL of the page
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
          <Product product={data.product} sizeData={data.sizeData} ></Product> 
      </section>
  )
}

export default ProductPage;
