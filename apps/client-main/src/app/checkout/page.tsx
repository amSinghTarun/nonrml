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
    // const { data: session, status } = useSession({
    //     required: true,
    //     onUnauthenticated: () => {
    //         if(appbarUtil === "CART" || appbarUtil == "") 
    //             setAppbarUtil("USER_ACCESSIBILITY") 
    //     }
    // });
    // const userAddresses = trpc.viewer.address.getAddresses.useQuery(undefined, {
    //     staleTime: Infinity,
    //     refetchOnWindowFocus: false,
    //     enabled: !!session
    // });

    return (
        <>
            <section className="flex absolute flex-row w-screen text-black justify-center items-center bg-white"> 
                <Checkout className="pt-16 mb-32 w-[97%] xl:w-[50%]" buyOption={buyOption} />
            </section>
        </>
    )
}
 
export default CheckoutPage;