// ProductPage.tsx
import ProductContainer from "@/components/product/ProductContainer";

const ProductPage = async ({ params }: { params: Promise<{ productSku: string }> }) => {
    const { productSku } = await params;

    return (
        <section className="flex flex-col border-t border-black w-screen h-screen text-black">
            <h1 className="text-left py-5 px-5 bg-stone-700 font-bold text-white">Product: {productSku}</h1>
            <ProductContainer productSku={productSku} />
        </section>
    );
};

export default ProductPage;