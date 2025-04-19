"use client"

import { Products } from "@/components/Products";
import { trpc } from '@/app/_trpc/client';
import { redirect } from "next/navigation";

const ProductsPage = () => {
    const products = trpc.viewer.product.getProducts.useQuery({admin: true});
    return (
        <>
            <section className="   flex flex-col w-screen h-screen text-black text-sm">
                <div className="flex flex-row py-5 px-5 bg-stone-700 rounded-t-lg font-bold text-white justify-between">
                    <h1 className="text-left p-2 justify-center">Products</h1>
                    <button onClick={()=> redirect("/create/product")} className=" p-2 rounded-xl bg-stone-400 hover:bg-stone-200 text-stone-700 ">Add Product</button>
                </div>
                <Products products={products} /> 
                {products.isLoading && <div>Loading...</div>}
                {products.error && <div>Error: {products.error.message}</div>}
            </section>
        </>
    )
}

export default ProductsPage