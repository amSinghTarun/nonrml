import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Shop All Products - NoNRML | Premium Streetwear Collection',
    description: 'Browse the complete NoNRML collection of premium unisex streetwear. Shop oversized tees, shirts, denim, and limited edition drops. Bold, expressive fashion from India\'s homegrown streetwear brand.',
    keywords: ['NoNRML products', 'streetwear collection', 'premium t-shirts', 'oversized shirts', 'denim jeans', 'unisex clothing', 'streetwear India', 'fashion drops', 'limited edition streetwear', 'buy streetwear online'],
    openGraph: {
        title: 'Shop All Products - NoNRML Premium Streetwear',
        description: 'Browse the complete collection of premium unisex streetwear. Oversized tees, shirts, denim & limited drops.',
        url: 'https://www.nonrml.co.in/collections',
        type: 'website',
        locale: 'en_IN',
        siteName: 'NoNRML',
        images: [{
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'NoNRML Product Collection',
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Shop NoNRML Streetwear Collection',
        description: 'Premium unisex streetwear - oversized tees, shirts, denim & limited drops.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://www.nonrml.co.in/collections',
    },
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
