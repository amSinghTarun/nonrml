"use client"
import { cn } from "@/lib/utils";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import React from "react";

type ReturnOrders = RouterOutput["viewer"]["return"]["getReturnOrders"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

interface ReturnProps {
    className?: string,
    returnOrders: ReturnOrders
}

export const Returns : React.FC<ReturnProps> = ({ className, returnOrders }) => {
    console.log(returnOrders)
    return (
        <div className={cn("h-screen w-full p-2 pb-6 flex flex-col lg:flex-row", className)}>
            <h1 className="flex lg:flex-col text-base text-neutral-700 lg:basis-5/12 font-medium p-1 lg:justify-center lg:text-center">Return Orders</h1>
            <div className="space-y-7 lg:space-y-10 p-2 lg:p-4 flex flex-1 flex-col overflow-y-scroll overscroll-auto scrollbar-hide">
            {
                returnOrders.map( (order, index) => {
                    return ( <div className="space-y-2 hover:shadow-sm w-full h-fit hover:shadow-neutral-200 shadow-sm shadow-neutral-100 p-2 text-xs rounded-md text-neutral-800">
                        <div className="flex flex-col justify-between space-y-1">
                            <div className="flex justify-between">
                                <p className="font-medium lg:text-sm"> RET-{order.id} </p>
                                <p className="text-neutral-600"> {order.createdAt.toDateString()}</p>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <p className=""> Return Status </p>
                                <p> {order.returnStatus == "CANCELLED_ADMIN" ? "CANCELLED BY ADMIN" : order.returnStatus.replaceAll("_", " ")} </p>
                            </div>
                            { Number(order.refundAmount) != 0 && <div className="flex justify-between text-neutral-600">
                                    <p> {"order.creditNote[0].creditCode"} </p>
                                    <p> {convertStringToINR(Number(order.creditNote[0].value))} </p>
                                </div>
                            }
                        </div>
                        <div className="flex flex-col space-y-2 text-neutral-600">
                            <div className="flex justify-between text-xs text-neutral-500">Products ({order.returnItems.length})</div>
                            <div className="space-y-1">
                                { order.returnItems.map((product, index) => (
                                    <div key={index} className="flex flex-col text-xs text-neutral-800" >
                                        <div className="flex flex-row space-x-3">
                                            <Image className="rounded-sm" src={`${product.orderProduct.productVariant.product.productImages[0].image}`} alt="product image" width={80} height={50} sizes="100vw"/>
                                            <div className="flex flex-col flex-1 justify-center space-y-1">
                                                <p className="font-medium">{product.orderProduct.productVariant.product.name.toUpperCase()} ( {product.orderProduct.productVariant.size} )</p>
                                                <p>Return Quantity: {product.quantity}</p>
                                                { product.rejectedQuantity ? <p>Rejected Quantity: {product.rejectedQuantity}</p> :  <></>}
                                            </div>
                                        </div>
                                    </div>
                                ) ) }
                            </div>
                        </div>
                    </div> )
                })
            }
            </div>
        </div>
    )
}