"use client"

import { BaseInventory } from '@/components/BaseInventory';
import { trpc } from '@/app/_trpc/client';
import { redirect, useSearchParams } from "next/navigation";

const BaseInvetoryPage = () => {
    const baseInventorySku = useSearchParams().get('baseInventorySku');
    const searchParam = baseInventorySku ? {sku: baseInventorySku} : {}
    const inventory = trpc.viewer.baseSkuInventory.getBaseInventory.useQuery(searchParam);
    return (
        <>
            <section className="flex flex-col text-sm    w-screen h-screen text-black ">
                <div className='flex flex-row justify-between p-5 bg-stone-700 font-bold'>
                    <h1 className="flex items-center text-white">Base Inventory</h1>
                    <button className='p-2 bg-white  hover:bg-stone-200 rounded-lg text-stone-700' onClick={()=> redirect("/create/baseInventory")}>Add Base INVENTORY</button>
                </div>
                <BaseInventory inventory={inventory}/>
                {inventory.isLoading && <div>Loading...</div>}
                {inventory.error && <div>Error: {inventory.error.message}</div>}
                <span className=" text-center text-orange-400">To delete any inventory item, first make its quantity 0.</span>
            </section>
        </>
    )
}

export default BaseInvetoryPage