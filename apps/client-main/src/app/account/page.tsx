import Orders from "@/components/Orders";
import React from "react"
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";

const OrdersPage = async () => {
    await redirectToHomeIfNotLoggedIn()
    return (
        <>
            <section className="z-30 pt-14 flex flex-row w-screen h-screen bg-white text-black justify-center mb-64 lg:mb-32">
                <Orders/>
            </section>
        </>
    )
}

export default OrdersPage;