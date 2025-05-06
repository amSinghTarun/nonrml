import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";
import { Metadata } from "next";

export const metadata: Metadata = {
    // Basic metadata fields
    title: `ALL PRODUCTS - NoNRML`,
    description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
    keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
    robots: 'index, follow',
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
