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
            <section className="pt-14 pb-5 z-30 flex-col min-h-screen h-auto w-screen overflow-y-scroll overscroll-none flex bg-white mb-64 lg:mb-32 scrollbar-hide">
                <Orders/>
            </section>
        </>
    )
}

export default OrdersPage;