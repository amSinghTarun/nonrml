import Orders from "@/components/Orders";
import React from "react"
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { serverClient } from "../_trpc/serverClient";

const OrdersPage = async () => {
    await redirectToHomeIfNotLoggedIn();
    const {data: userContact} = await (await serverClient()).viewer.user.getUserContact();
    return (
        <>
            <section className="pt-14 pb-5 z-30 scrollbar-hide flex flex-row min-h-screen h-auto w-screen overflow-y-scroll overscroll-none bg-white text-black justify-center mb-64 lg:mb-32">
                <Orders userContact={userContact}/>
            </section>
        </>
    )
}

export default OrdersPage;