"use client"

import { Inventory } from "@/components/Inventory";
import { trpc } from '@/app/_trpc/client';
import { useSearchParams } from "next/navigation";

export default () => {
    const productSku = useSearchParams().get('productSku');
    const inventory = trpc.viewer.inventory.getInventory.useQuery({
        sku : productSku ?? undefined
    });

    return (
        <>
            <section className="flex flex-col   w-screen h-screen text-black ">
                <h1 className="text-left py-5 px-5 bg-stone-600 rounded-t-lg font-bold text-white">Variant - Base Map</h1>
                <Inventory inventory={inventory}/> 
                {inventory.isLoading && <div>Loading...</div>}
                {inventory.error && <div>Error: {inventory.error.message}</div>}
            </section>
        </>
    )
}