"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { trpc } from "@/app/_trpc/client";
import { GeneralButton } from "@/components/ui/buttons";
import Link from "next/link";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelOrderDialog from "./dialog/CancelOrderDialog";
import { cancelOrder } from "@/app/actions/order.actions";
import { signOut } from "next-auth/react";

interface OrdersProps {
    className?: string
}

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

const getOrderProgressMessage = (status: string) => {
    switch (status) {
        case "ACCEPTED":
            return "Your order is being packed with care";
        case "SHIPPED":
            return "Your order is on its way";
        case "DELIVERED":
            return "Order successfully delivered";
        default:
            return "Order processing";
    }
};

const getOrderPaymentStatus = (status: string) => {
    switch (status) {
        case "paid":
            return "COMPLETE";
        case "failed":
            return "FAILED";
        case "COD":
            return "PENDING";
        default:
            return "Order processing";
    }
};

const renderOrderStatus = (status: string) => {
    const statusEnum = {
        "PENDING": "PENDING",
        "ACCEPTED": "PACKING",
        "SHIPPED": "SHIPPED",
        "DELIVERED": "DELIVERED"
    };
    
    return statusEnum[status as keyof typeof statusEnum];
};

export const Orders : React.FC<OrdersProps> = ({className})  => {
        
    const userOrders = trpc.viewer.orders.getUserOrders.useQuery();

    return (
        <div className={cn("overflow-none h-full w-full p-2 pb-6 space-y-2 flex flex-col lg:flex-row", className)}>
            <div className="flex flex-row lg:flex-col lg:text-center justify-between lg:justify-center lg:basis-5/12 p-2 text-xs lg:text-sm gap-4">
                <span className="hover:font-medium cursor-none font-medium text-neutral-600">6265176187</span>
                <span className="cursor-pointer hover:underline text-neutral-500" onClick={()=> {signOut()}}> LOGOUT</span>
            </div>
            <div className="p-2 space-y-3 lg:p-4 overflow-y-scroll overscroll-auto scrollbar-hide">
                {/* <p className="text-sm text-neutral-600">ORDERS</p> */}
                {
                    userOrders.isLoading &&
                    <article className="flex flex-row p-2 w-full h-full justify-center items-center bg-white text-xs">
                        <p>Finding Your Orders For You .....</p>
                    </article>
                }
                {
                    userOrders.isSuccess && userOrders.data.data.length == 0 ? 
                    <article className="flex flex-col p-3 justify-center w-full h-full items-center space-y-3">
                        <span className="flex justify-center items-center font-normal text:xs">You Haven't Placed Any Orders Yet :(</span>
                        <GeneralButton 
                            display="ENTER STORE" 
                            className="flex w-[60%] bg-neutral-800 items-center justify-center rounded-md p-6 text-white text-sm font-normal" 
                            onClick={() => {}} 
                        />
                    </article>
                    :
                    <div className="flex flex-row rounded-xl flex-wrap w-full space-y-5">
                    {userOrders.data?.data.map((order, index) => (
                        <article key={index} className="relative h-auto w-full p-2 rounded-md text-sm hover:shadow-sm hover:shadow-neutral-200 transition-all duration-200 ">
                            <Link className="font-normal flex flex-col lg:text-sm cursor-pointer flex-1" href={`/order/${order.id}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">{order.id}</span>
                                    <span className="text-xs text-neutral-500">{order.createdAt.toDateString()}</span>
                                </div>
                                
                                <div className="flex flex-col space-y-1 text-xs lg:text-sm">
                                    {/* Order Status */}
                                    <div className="flex justify-between items-center text-neutral-500">
                                        <span>Order Status</span>
                                        <span>{renderOrderStatus(order.orderStatus)}</span>
                                    </div>
                
                                    {/* Payment Status */}
                                    <div className="flex justify-between items-center text-neutral-500">
                                        <span>Payment</span>
                                        <span> {getOrderPaymentStatus(order.Payments[0].paymentStatus)} </span>
                                    </div>
                
                                    {/* Order Details */}
                                    <div className="flex justify-between items-center text-neutral-500">
                                        <span>{order.productCount} {order.productCount > 1 ? 'items' : 'item'}</span>
                                        <span>{convertStringToINR(+order.totalAmount)}</span>
                                    </div>
                
                                </div>
                            </Link>
                
                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-neutral-100 "> 
                                
                                { order.orderStatus != "PENDING" && order.orderStatus != "DELIVERED" && (
                                    <div className=" text-xs text-neutral-600">
                                        {getOrderProgressMessage(order.orderStatus)}
                                    </div>
                                )}

                                {order.orderStatus === "PENDING" && (
                                    <CancelOrderDialog 
                                        cancelPurchase={async () => {
                                            await cancelOrder({orderId: order.id}); 
                                            userOrders.refetch();
                                        }}
                                    />
                                )}
                                
                                {order.orderStatus === "DELIVERED" && (order.return.length || order.replacementOrder.length) ? (
                                    <div className="flex divide-x divide-neutral-200">
                                        {order.return.length > 0 && (
                                            <Link
                                                href={`/returns/${order.id}`}
                                                className="text-xs pr-2 text-neutral-600 hover:underline transition-all duration-200"
                                            >
                                                View Returns
                                            </Link>
                                        )}
                                        {order.replacementOrder.length > 0 && (
                                            <Link
                                                href={`/exchanges/${order.id}`}
                                                className="text-xs pl-2 text-neutral-600 hover:underline transition-all duration-200"
                                            >
                                                View Replacements
                                            </Link>
                                        )}
                                    </div>
                                ): <p className="text-xs pl-2 text-neutral-600">Order successfully delivered</p> }
                            </div>
                        </article>
                    ))}
                </div>
                }                   
            </div>
        </div>
    )
}

export default Orders;