import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Order } from "@/components/Order";
import React from "react";

const OrdersPage = async ({params}: {params: {orderId: string}}) => {
    const { orderId } = await params;
    await redirectToHomeIfNotLoggedIn();

    const {data: orderDetals} = await ( await serverClient()).viewer.orders.getUserOrder({orderId: orderId});
    return (
        <section className="pt-14 pb-5 z-30 scrollbar-hide flex flex-row min-h-screen h-auto w-screen overflow-y-scroll overscroll-none bg-white text-black justify-center mb-64 lg:mb-32">
            <Order orderDetails={orderDetals} /> 
        </section>
    )
}

export default OrdersPage; 