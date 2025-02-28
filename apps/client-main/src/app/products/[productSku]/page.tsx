import { serverClient } from "@/app/_trpc/serverClient";
import Product from "@/components/Product";

const ProductPage = async ({ params }: { params: { productSku: string } })=> {

    const { data : {product, productSizeQuantities, categorySizeChart} } = await (await serverClient()).viewer.product.getProduct({productSku: (await params).productSku});
 
    return (
        <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-scroll flex bg-white mb-60 lg:mb-24">
            <Product product={product} productSizeQuantities={productSizeQuantities} categorySizeChart={categorySizeChart}></Product> 
        </section>
    )
}

export default ProductPage;
