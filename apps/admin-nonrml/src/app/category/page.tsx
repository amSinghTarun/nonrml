"use client"

import Category from "@/components/Categories";
import { trpc } from '@/app/_trpc/client';
import { redirect } from "next/navigation";

export default () => {

    const categories = trpc.viewer.productCategories.getProductCategories.useQuery({
        all: true
    });

    return (
        <>
            <section className="flex flex-col   w-screen h-screen text-black ">
                <div className="flex flex-row py-5 px-5 bg-stone-700 font-bold text-white justify-between">
                    <h1 className="text-left p-2 font-bold text-white">Categories</h1>
                    <button onClick={()=> redirect("/create/category")} className=" p-2 rounded-xl bg-stone-400 hover:bg-stone-200 text-stone-700 ">Add Category</button>
                </div>
                <Category categories={categories.data?.adminCategories!}/> 
                {categories.isLoading && <div>Loading...</div>}
                {categories.error && <div>Error: {categories.error.message}</div>}
            </section>
        </>
    )
}