import Orders from "@/components/Orders";
import React from "react"
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { serverClient } from "../_trpc/serverClient";

const OrdersPage = async () => {
    await redirectToHomeIfNotLoggedIn();
    const {data: userContact} = await (await serverClient()).viewer.user.getUserContact();
    return (
        <>
            <section className="z-30 pt-14 flex flex-row w-screen h-screen bg-white text-black justify-center mb-64 lg:mb-32">
                <Orders userContact={userContact}/>
            </section>
        </>
    )
}

export default OrdersPage;