"use client"

import React from "react"
import { cn } from "@nonrml/common"
import { trpc } from "@/app/_trpc/client";
import { GeneralButtonTransparent } from "@/components/ui/buttons";
import Link from "next/link";
import CancelOrderDialog from "./dialog/CancelOrderDialog";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { prismaTypes } from "@nonrml/prisma";
import { useToast } from "@/hooks/use-toast";
import { convertStringToINR } from "@/lib/utils";

interface OrdersProps {
    className?: string
}

const getOrderProgressMessage = (status: prismaTypes.OrderStatus) => {
    switch (status) {
        case "ACCEPTED":
            return "Your order is being packed with care";
        case "SHIPPED":
            return "Your order is on its way";
        case "DELIVERED":
            return "Order successfully delivered";
        case "CANCELED":
            return "Order cancelled";
        case "CANCELED_ADMIN":
            return "Order cancelled by NoNRML";
        case "PAYMENT_FAILED":
            return "Payment failed";
        default:
            return "Processing Confirmation";
    }
};

const getOrderPaymentStatus = (status: prismaTypes.PaymentStatus | "") => {
    switch (status) {
        case "captured":
            return "COMPLETE";
        case "failed":
            return "FAILED";
        case "authorized":
            return "WAITING BANK APPROVAL";
        default:
            return "PENDING";
    }
};

const renderOrderStatus = (status: string) => {
    const statusEnum = {
        "PENDING": "PENDING",
        "ACCEPTED": "PACKING",
        "CANCELED": "CANCELED",
        "SHIPPED": "SHIPPED",
        "DELIVERED": "DELIVERED",
        "CANCELED_ADMIN": "CANCELED BY NoNRML",
        "PAYMENT_FAILED": "PAYMENT_FAILED"
    };
    
    return statusEnum[status as keyof typeof statusEnum];
};

export const Orders : React.FC<OrdersProps> = ({className})  => {

    const { toast } = useToast();
        
    const userOrders = trpc.viewer.orders.getUserOrders.useQuery(undefined,{
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    const cancelOrder = trpc.viewer.orders.cancelOrder.useMutation({
        onSuccess: () => {
            userOrders.refetch()
        },
        onError: () => {
            toast({
                duration: 1500,
                title: "Issue in cancelling order, please try after some time.",
                variant: "destructive"
            })
        }
    })
    console.log(userOrders.data?.data)
    return (
        <div className={cn("overflow-none h-screen w-full p-2 pb-6 space-y-2 flex flex-col lg:flex-row", className)}>
            <div className="flex flex-row lg:flex-col lg:text-center justify-between lg:justify-center lg:basis-5/12 p-2 text-xs lg:text-sm gap-4">
                <span className="hover:font-bold cursor-none font-bold text-neutral-600">{userOrders.data?.data.userContact}</span>
                <span className="cursor-pointer hover:underline text-neutral-500" onClick={()=> {signOut()}}> LOGOUT</span>
            </div>
            <div className="p-2 space-y-3 lg:p-4 overflow-y-scroll overscroll-auto w-full scrollbar-hide h-full">
                {
                    userOrders.isLoading &&
                    <article className="flex flex-row p-2 w-full h-full justify-center items-center bg-white text-xs">
                        <p>Finding Your Orders For You .....</p>
                    </article>
                }
                {
                    userOrders.isError &&
                    <article className="flex flex-row p-2 w-full h-full justify-center items-center bg-white text-xs">
                        <p>Something went wrong, please try after some time .....</p>
                    </article>
                }
                {
                    userOrders.isSuccess && (
                        userOrders.data.data.orders.length == 0 ? 
                        <article className="flex flex-col p-3 justify-center w-full h-full items-center space-y-3">
                            <span className="flex justify-center items-center font-normal text-xs">You Haven't Placed Any Orders Yet :(</span>
                            <GeneralButtonTransparent 
                                display="ENTER STORE" 
                                className="flex w-[60%] items-center justify-center p-6 text-xs font-normal" 
                                onClick={() => redirect("/collections")} 
                            />
                        </article>
                        :
                        <div className="flex flex-row rounded-xl flex-wrap w-full space-y-5">
                            {userOrders.data?.data.orders.map((order, index) => (
                                <article key={index} className="relative h-auto w-full p-2 rounded-md text-sm hover:shadow-sm hover:shadow-neutral-200 transition-all duration-200 ">
                                    <Link className="font-normal flex flex-col lg:text-sm cursor-pointer flex-1" href={`/orders/ORD-${order.id}${order.idVarChar}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold">{`ORD-${order.id}${order.idVarChar}`}</span>
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
                                                <span> {getOrderPaymentStatus(order.Payments?.paymentStatus || "")} </span>
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
                                    {/* so that prepaid order that aren't accepted shouldn't get cancelled */}
                                        {(order.orderStatus === "PENDING" && (order.Payments?.paymentStatus != "captured" && order.Payments?.paymentStatus != "authorized")) && (
                                            cancelOrder.isLoading && cancelOrder.variables?.orderId == order.id
                                            ? <p className="text-xs pl-2 text-neutral-600">Cancelling order...</p> 
                                            : <CancelOrderDialog 
                                                cancelPurchase={async () => {
                                                    await cancelOrder.mutateAsync({orderId: order.id})
                                                }}
                                            />
                                        )}
                                        
                                        {order.orderStatus === "DELIVERED" ? (
                                            (order.return.length || order.replacementOrder.length) ?
                                            <div className="flex divide-x divide-neutral-200">
                                                {/* {order.return.length > 0 && (
                                                    <Link
                                                        href={`/returns/${order.id}`}
                                                        className="text-xs pr-2 text-neutral-600 hover:underline transition-all duration-200"
                                                    >
                                                        View Returns
                                                    </Link>
                                                )} */}
                                                {order.replacementOrder.length > 0 && (
                                                    <Link
                                                        href={`/exchanges/${order.id}`}
                                                        className="text-xs pl-2 text-neutral-600 hover:underline transition-all duration-200"
                                                    >
                                                        View Replacements
                                                    </Link>
                                                )}
                                            </div> : <p className="text-xs pl-2 text-neutral-600">Order successfully delivered</p> 
                                        ): order.orderStatus != "PENDING" && <div className=" text-xs text-neutral-500">{getOrderProgressMessage(order.orderStatus)}</div> }
                                    
                                    </div>
                                </article>
                            ))}
                        </div>
                    )
                }                   
            </div>
        </div>
    )
}

export default Orders;