"use client"

import { Checkout } from "@/components/Checkout"
import React from "react";
import { useSearchParams } from "next/navigation";

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const buyOption = searchParams.get('purchase');
    return (
        <>
            <section className="flex absolute flex-row w-screen text-black h-full justify-center items-center bg-white mb-36"> 
                <Checkout className="mb-3 w-[97%] rounded-sm shadow-productPage h-[80%] xl:w-[50%]" buyOption={buyOption} />
            </section>
        </>
    )
}
 
export default CheckoutPage;