"use client"

import React from "react";
import { SizeChartHierarchyTable } from "@/components/sizeChart/SizeChart";
import { redirect } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

const SizeChartPage = () => {
    const sizeChartData = trpc.viewer.sizeChart.getSizeChart.useQuery({});
    return (
        <section className="   flex flex-col w-screen h-screen text-black text-sm">
            <div className="flex flex-row py-5 px-5 bg-stone-700 rounded-t-lg font-bold text-white justify-between">
                <h1 className="text-left p-2 justify-center">Size Chart</h1>
                <button onClick={()=> redirect("/create/sizeChart")} className=" p-2 rounded-xl bg-stone-400 hover:bg-stone-200 text-stone-700 ">Add Size Chart</button>
            </div>
            {sizeChartData.data?.data && <SizeChartHierarchyTable sizeChartData={sizeChartData.data.data} />}
            {sizeChartData.isLoading && <div>Loading...</div>}
            {sizeChartData.error && <div>Error: {sizeChartData.error?.message}</div>}
        </section>
    );
};

export default SizeChartPage;
