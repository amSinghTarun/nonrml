import { serverClient } from "@/app/_trpc/serverClient";
import { Order } from "@/components/Order";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    // Basic metadata fields
    title: `ORDER DETAILS - NoNRML`,  // Browser tab title, search engine title
    description: `Buy Premium Unisex Streetwear T-shirts, Shirts and Jeans online from NoNRML `,  // Meta description for SEO
    keywords: ["premium T-shirts, Shirts and Jeans", "premium", "oversize T-shirts, Shirts and Jeans", "Streetwear", "streetwear ", "unisex"],
    robots: 'index, follow',
}

const OrdersPage = async ({params, searchParams}: {params: Promise<{orderId: string}>,  searchParams: Promise<{ [key: string]: string | string[] | undefined }>}) => {
    
    const { orderId } = await params;
    // const verifyParam = (await searchParams);

    const {data: orderDetals} = await ( await serverClient()).viewer.orders.getUserOrder({orderId: orderId});
    return (
        <section className="pt-14 pb-5 z-30 scrollbar-hide flex flex-row min-h-screen h-auto w-screen overflow-y-scroll overscroll-none bg-white text-black justify-center mb-64 lg:mb-32">
            <Order orderDetails={orderDetals.orderDetails} refunds={orderDetals.bankRefunds} /> 
        </section>
    )
}

export default OrdersPage;