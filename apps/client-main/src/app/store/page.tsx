import { serverClient } from "@/app/_trpc/serverClient";
import Products from "@/components/Products";

const StorePage = async () => {
    const { data: products, nextCursor } = await (await serverClient()).viewer.product.getProducts({});

    return (
        <section className="mt-14 z-30 flex-col min-h-screen h-auto w-screen overflow-scroll flex bg-white mb-60 lg:mb-24">
            <Products products={products} nextCursor={nextCursor}></Products>
        </section>
    )
}

export default StorePage;
