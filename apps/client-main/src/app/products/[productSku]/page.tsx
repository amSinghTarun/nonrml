import { RouterOutput } from "@/app/_trpc/client";
import { serverClient } from "@/app/_trpc/serverClient";
import Loading from "@/app/loading";
import Product from "@/components/Product";

const ProductPage = async ({ params }: { params: { productSku: string } })=> {

    const { data } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
 
    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-y-scroll overscroll-none flex bg-white mb-64 lg:mb-32 scrollbar-hide">
            <Product product={data.product} productSizeQuantities={data.productSizeQuantities}></Product> 
        </section>
    )
}

export default ProductPage;
