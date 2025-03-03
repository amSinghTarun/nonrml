import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Order } from "@/components/Order";
import React from "react";

const OrdersPage = async ({params}: {params: {orderId: string}}) => {
    const { orderId } = await params;
    await redirectToHomeIfNotLoggedIn();

    const {data: orderDetals} = await ( await serverClient()).viewer.orders.getUserOrder({orderId: orderId});
    return (
        <section className="z-30 pt-14 flex flex-row w-screen h-screen text-black justify-center bg-white mb-64 lg:mb-32">
            <Order orderDetails={orderDetals} /> 
        </section>
    )
}

export default OrdersPage; 