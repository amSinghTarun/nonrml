import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";


const StorePage = async ({ params }: { params: { category: string } }) => {
    const category = (await params).category;
    const { data: products, nextCursor } = await (await serverClient()).viewer.product.getProducts({categoryName: category});

    return (
        <section className="pt-14 z-30 flex-col min-h-screen h-auto w-screen overflow-scroll flex bg-white mb-60 lg:mb-24">
            <Products categoryName={category} products={products} nextCursor={nextCursor}></Products>
        </section>
    )
}

export default StorePage;
