"use client"

import { Checkout } from "@/components/Checkout"
import React from "react";
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const buyOption = searchParams.get('purchase');
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated: () => {
            if(appbarUtil === "CART" || appbarUtil == "") 
                setAppbarUtil("USER_ACCESSIBILITY") 
        }
    });
    const userAddresses = trpc.viewer.address.getAddresses.useQuery(undefined, {
        enabled: !!session
    });

    return (
        <>
            <section className="flex flex-row w-screen h-screen text-black justify-center items-center"> 
                { (session || status != "loading") ? <Checkout className="h-[80%] w-[90%] xl:w-[50%]" buyOption={buyOption} userAddresses={userAddresses} /> : <></>}
            </section>
        </>
    )
}
 
export default CheckoutPage;