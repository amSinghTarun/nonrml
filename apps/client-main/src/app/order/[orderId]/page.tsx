import { serverClient } from "@/app/_trpc/serverClient";
import { redirectToHomeIfNotLoggedIn } from "@/app/lib/utils";
import { Order } from "@/components/Order";
import React from "react";

const OrdersPage = async ({params}: {params: {orderId: string}}) => {
    const { orderId } = await params;
    await redirectToHomeIfNotLoggedIn();

    const {data: orderDetals} = await ( await serverClient()).viewer.orders.getUserOrder({orderId: +orderId});
    return (
        <section className="z-30 pt-24 flex flex-row w-screen h-screen text-black justify-center">
            <Order className="h-[95%] w-[90%] lg:w-[50%]" orderDetails={orderDetals} /> 
        </section>
    )
}

export default OrdersPage;

