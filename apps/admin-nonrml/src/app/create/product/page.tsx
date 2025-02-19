"use client"
import { trpc } from "@/app/_trpc/client";
import { CreateProduct } from "@/components/create/createProduct";

export default () => {
    const categories = trpc.viewer.productCategories.getProductCategories.useQuery({all: true});
    if (categories.isLoading) return <div>Loading...</div>;
    if (categories.error) return <div>Error: {categories.error.message}</div>;
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD NEW PRODUCT</h1>
                <div className=" m-2 p-4 bg-stone-700 text-white flex flex-col rounded-md text-sm">
                    <span>CATEGORIES DETAILS:</span>
                    <span> { 
                        categories.data?.adminCategories?.map( category => (
                            ` |__ ${category.displayName} : ${category.id} __| `
                        ))
                    } </span>
                </div>
                <CreateProduct />
            </section>
        </>
    )   
}