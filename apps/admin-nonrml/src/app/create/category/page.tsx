"use client"
import { trpc } from "@/app/_trpc/client";
import { CreateProductCategory } from "@/components/create/createCategory";

export default () => {
    const categories = trpc.viewer.productCategories.getProductCategories.useQuery({all: true});
    if (categories.isLoading) return <div>Loading...</div>;
    if (categories.error) return <div>Error: {categories.error.message}</div>;
    console.log(categories.data.adminCategories)
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD NEW CATEGORY</h1>
                <CreateProductCategory categoriesQuery={categories} />
            </section>
        </>
    )   
}