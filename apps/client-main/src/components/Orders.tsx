"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { trpc } from "@/app/_trpc/client";
import { GeneralButton } from "@/components/ui/buttons";
import Link from "next/link";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CancelOrderDialog from "./dialog/CancelOrderDialog";
import { cancelOrder } from "@/app/actions/order.actions";

interface OrdersProps {
    className?: string
}

export const Orders : React.FC<OrdersProps> = ({className})  => {
        
    const userOrders = trpc.viewer.orders.getUserOrders.useQuery();

    return (
        <div className={cn("rounded-xl overflow-y-scroll bg-white/10 backdrop-blur-3xl h-full w-full p-2 pb-6", className)}>
        {
            userOrders.isLoading &&
            <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                <div className="backdrop-blur-3xl bg-white/10 p-4 font-medium rounded-xl text-sm">
                    <p>Finding Your Orders For You .....</p>
                </div>
            </article>
        }
        {
            userOrders.isSuccess && userOrders.data.data.length == 0 ? 
            <article className="flex flex-col p-3 overflow-x-scroll justify-center w-full h-full">
                <div className="flex flex-col space-y-5 items-center w-full h-auto">
                    <div className="flex justify-center items-center font-medium text-sm ">You Haven't Placed Any Orders Yet :(</div>
                    <GeneralButton 
                        display="ENTER STORE" 
                        className="flex w-[60%] bg-black hover:bg-white hover:text-black hover:shadow-sm hover:shadow-black items-center justify-center rounded-xl p-10 text-white text-md font-medium" 
                        onClick={() => {}} 
                    />
                </div> 
            </article>
            :
                <div className="flex flex-row rounded-xl flex-wrap w-full space-y-7 ">
                    { userOrders.data?.data.map((order, index) => {
                        return(
                        <article key={index} className="relative h-auto w-full p-2 pb-6 rounded-xl text-sm bg-white/25">
                            <Link className="font-normal flex flex-col hover:cursor-pointer flex-1" href={`/order/${order.id}`}>
                                    <div className="flex justify-between">
                                        <p> Order Id : </p>
                                        <p> {order.id} </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p> Products : </p>
                                        <p> {order.productCount} </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p> Purchase Date : </p>
                                        <p> {order.createdAt.toDateString()} </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p> Payment Status : </p>
                                        <p> {order.payment?.paymentStatus} </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p> Order Status : </p>
                                        <p> {order.orderStatus} </p>
                                    </div>
                                </Link>
                                <div className="items-center justify-evenly flex flex-row text-xs sm:text-sm absolute w-full -bottom-2 space-x-1 sm:space-x-7"> 
                                    <div className="basis-1/3 text-end"> {
                                        order.return.length > 0 && <Link 
                                        href={`/returns/${order.id}`}
                                        className="rounded-full px-2 sm:px-4 bg-black py-2 text-white hover:bg-white hover:text-black"
                                        >RETURN(s)</Link> 
                                    } </div>
                                    <div className="text-center">
                                        {
                                            order.orderStatus == "CONFIRMED" && 
                                            <CancelOrderDialog cancelPurchase={async () => {await cancelOrder({orderId: order.id}); userOrders.refetch()}}></CancelOrderDialog>
                                        }
                                        { 
                                            order.orderStatus == "ACCEPTED" && <Link
                                                href={""}
                                                className="rounded-full px-2 py-2 bg-white  text-black"
                                            >{`PACKING`}</Link>
                                        }
                                        {
                                            order.orderStatus == "SHIPPED" && <Link 
                                            href={"/other_service"} 
                                            className="rounded-full px-4 py-3 bg-white  text-black hover:bg-black hover:text-white"
                                            ><LocalShippingIcon/></Link>
                                        }
                                        {
                                            order.orderStatus == "DELIVERED" && <Link
                                                href={""}
                                                className="rounded-full px-2 py-2 bg-white  text-black hover:cursor-none"
                                            >DELIVERED</Link>
                                        }
                                    </div>
                                    <div className="basis-1/3 text-start"> {
                                        order.replacementOrder.length > 0 && <Link
                                        href={`/exchanges/${order.id}`}
                                        className="rounded-full px-2 sm:px-4 bg-black py-2  text-white hover:bg-white hover:text-black"
                                        >EXCHANGE(s)</Link>
                                    } </div>
                                </div>
                        </article>)
                    })}
                </div>
        }
        </div>
    )
}

export default Orders;