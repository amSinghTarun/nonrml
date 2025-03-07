import { serverClient } from "@/app/_trpc/serverClient";
import Product from "@/components/Product";

const ProductPage = async ({ params }: { params: { productSku: string } })=> {

    const { data : {product, productSizeQuantities} } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
 
    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-y-scroll overscroll-none flex bg-white mb-64 lg:mb-32 scrollbar-hide">
            <Product product={product} productSizeQuantities={productSizeQuantities}></Product> 
        </section>
    )
}

export default ProductPage;
