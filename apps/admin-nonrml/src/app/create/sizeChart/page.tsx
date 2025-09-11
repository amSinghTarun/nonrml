"use client"
import { SizeChartForm } from "@/components/create/createSizeChart";

const SizeChartCreatePage = () => {
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD NEW SIZE</h1>
                <SizeChartForm />
            </section>
        </>
    )   
}

export default SizeChartCreatePage