"use client"
import { trpc } from "@/app/_trpc/client";
import { SizeChartForm } from "@/components/create/createSizeChart";

export default ({params} : {params: {sizeChartId: string}}) => {
    const sizeChartId = ( params).sizeChartId
    const categories = trpc.viewer.sizeChart.getSizeChart.useQuery({id: +sizeChartId});
    if (categories.isLoading) return <div>Loading...</div>;
    if (categories.error) return <div>Error: {categories.error.message}</div>;
    console.log(categories.data.data)
    return (
        <>
            <section className="flex flex-col w-screen h-screen  ">
                <h1 className="bg-stone-700 text-white p-3">ADD NEW CATEGORY</h1>
                <SizeChartForm parentId={categories.data.data[0].id} parentName={categories.data.data[0].name} parentType={categories.data.data[0].type} />
            </section>
        </>
    )   
}