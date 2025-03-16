"use client"

import { trpc } from '@/app/_trpc/client';
import OrderDetails from "@/components/Order";

const OrderPage = ({params} : {params: {orderId: string}}) => {
    const orderId = params.orderId
    const orderResponse = trpc.viewer.orders.getOrder.useQuery({ orderId: orderId }, {
        staleTime: Infinity,
        cacheTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })
    return (
        <>
            <section className="flex flex-col border-t border-black w-screen h-screen text-black ">
                <h1 className="text-left py-5 px-5 bg-stone-700 font-bold text-white">Order: {orderId}</h1>
                {orderResponse.data && <OrderDetails orderQuery={orderResponse}></OrderDetails>}
                {orderResponse.isLoading && <div>Loading...</div>}
                {orderResponse.error && <div>Error: {orderResponse.error.message}</div>}
            </section>
        </>
    )
}

export default OrderPage;