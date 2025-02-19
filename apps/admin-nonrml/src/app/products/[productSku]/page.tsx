"use client"

import { Products } from "@/components/Products";
import { trpc } from '@/app/_trpc/client';
import { Product } from "@/components/Product";

export default ({params} : {params: {productSku: string}}) => {
    const productSku = ( params).productSku
    const product = trpc.viewer.product.getAdminProduct.useQuery({productSku: productSku});
    return (
        <>
            <section className="   flex flex-col border-t border-black w-screen h-screen text-black ">
                <h1 className="text-left py-5 px-5 bg-stone-700 font-bold text-white">Product: {productSku}</h1>
                <Product productDetails={product}></Product>
                {product.error && <div>Error: {product.error.message}</div>}
            </section>
        </>
    )
}