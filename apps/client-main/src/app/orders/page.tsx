"use client"

import Orders from "@/components/Orders";
import React from "react"
import { useSession } from "next-auth/react";
import { useSetAppbarUtilStore } from "@/store/atoms";

const OrdersPage = () => {
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated: () => {
            if(appbarUtil === "CART" || appbarUtil == "") 
                setAppbarUtil("USER_ACCESSIBILITY") 
        }
    });

    return (
        <>
            <section className="pt-14 pb-5 z-30 flex flex-col min-h-screen h-auto w-screen bg-white mb-[335px] lg:mb-[235px]">
                <Orders/>
            </section>
        </>
    )
}

export default OrdersPage;