import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";


const StorePage = async ({ params }: { params: Promise<{ category: string }> }) => {
    const category = (await params).category;
    const { data: products, nextCursor } = await (await serverClient()).viewer.product.getProducts({categoryName: category, cursor: undefined});

    return (
        <section className="pt-14 z-30 flex-col min-h-screen h-auto w-screen flex bg-white mb-60 lg:mb-24">
            <Products categoryName={category} products={products} nextCursor={nextCursor}></Products>
        </section>
    )
}

export default StorePage;
