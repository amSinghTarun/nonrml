"use client"
import { trpc } from "@/app/_trpc/client";
import { SizeChartForm } from "@/components/create/createSizeChart";

export default () => {
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD NEW CATEGORY</h1>
                <SizeChartForm />
            </section>
        </>
    )   
}