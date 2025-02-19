import Orders from "@/components/Orders";
import React from "react"
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";

const OrdersPage = async () => {
    await redirectToHomeIfNotLoggedIn()
    return (
        <>
            <section className="z-30 pt-20 flex flex-row w-screen h-screen text-black justify-center ">
                <Orders className="h-[90%] w-[90%] lg:w-[50%]" /> 
            </section>
        </>
    )
}

export default OrdersPage;