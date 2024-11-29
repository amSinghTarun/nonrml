import { serverClient } from "@/app/_trpc/serverClient";
import Product from "@/components/Product";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

const ProductPage = async ({ params }: { params: { product: string } })=> {
    
    const { data : {product, productInventory, categorySizeChart} } = await (await serverClient()).viewer.product.getProduct({productId: Number(params.product.split("_")[1])});
 
    return (
            <section className="mt-14 z-30 flex-col h-screen w-screen overflow-scroll flex bg-transparent">
                <Product product={product} productInventory={productInventory} categorySizeChart={categorySizeChart}></Product> 
            </section>
    )
}

export default ProductPage;
