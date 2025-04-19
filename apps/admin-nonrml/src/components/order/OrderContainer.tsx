"use client"
import { trpc } from '@/app/_trpc/client';
import OrderDetails from "@/components/order/Order";

const OrderContainer = ({ orderId }: { orderId: string }) => {
    const orderResponse = trpc.viewer.orders.getOrder.useQuery(
        { orderId },
        {
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    );

    return (
        <>
            {orderResponse.data && <OrderDetails orderQuery={orderResponse} />}
            {orderResponse.isLoading && <div>Loading...</div>}
            {orderResponse.error && <div>Error: {orderResponse.error.message}</div>}
        </>
    );
};

export default OrderContainer;