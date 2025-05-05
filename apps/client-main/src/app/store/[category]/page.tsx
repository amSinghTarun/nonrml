import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";

type Props = {
    params: Promise<{ category: string }> 
}

export async function generateMetadata({ params }: Props) {
    const category = (await params).category;
    
    return {
      // Basic metadata fields
      title: `Premium ${category} - Unisex Streetwear ${category} Online - NoNRML`,  // Browser tab title, search engine title
      description: `Buy Premium Unisex Streetwear Oversize ${category} online from NoNRML `,  // Meta description for SEO
      keywords: ["premium ${category}", "${category}", "oversize ${category}", "Streetwear", "streetwear ${category}", "unisex ${category}"],
      robots: `index, follow`,
    };
}

const StorePage = async ({ params }: Props) => {
    const category = (await params).category;
    const { data: products, nextCursor } = await (await serverClient()).viewer.product.getProducts({categoryName: category, cursor: undefined});

    return (
        <section className="pt-14 z-30 flex-col min-h-screen h-auto w-screen flex bg-white mb-60 lg:mb-24">
            <Products categoryName={category} products={products} nextCursor={nextCursor}></Products>
        </section>
    )
}

export default StorePage;
