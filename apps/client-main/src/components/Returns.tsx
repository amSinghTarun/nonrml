"use client"
import { cn } from "@nonrml/common";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import React from "react";
import { convertStringToINR } from "@/lib/utils";

type ReturnOrders = RouterOutput["viewer"]["return"]["getReturnOrders"]["data"];

interface ReturnProps {
    className?: string,
    returnOrders: ReturnOrders
}

export const Returns : React.FC<ReturnProps> = ({ className, returnOrders }) => {
    console.log(returnOrders)
    return (
        <div className={cn("h-screen w-full p-2 pb-6 flex flex-col lg:flex-row", className)}>
            <h1 className="flex lg:flex-col text-base text-neutral-700 lg:basis-5/12 font-bold p-1 lg:justify-center lg:text-center">Return Orders</h1>
            <div className="space-y-7 lg:space-y-10 p-2 lg:p-4 flex flex-1 flex-col overflow-y-scroll overscroll-auto scrollbar-hide">
            {
                returnOrders.map( (order, index) => { 
                    return ( <div className="space-y-3 hover:shadow-sm w-full h-fit hover:shadow-neutral-200 shadow-sm shadow-neutral-100 p-2 text-xs rounded-md text-neutral-500">
                        <div className="flex flex-col justify-between space-y-1">
                            <div className="flex justify-between">
                                <p className="font-bold lg:text-sm text-neutral-800"> RET-{order.id} </p>
                                <p> {order.createdAt.toDateString()}</p>
                            </div>
                            <div className="flex justify-between">
                                <p> Return Status </p>
                                <p> {order.returnStatus == "CANCELLED_ADMIN" ? "CANCELLED BY ADMIN" : order.returnStatus.replaceAll("_", " ")} </p>
                            </div>
                            { Number(order.refundAmount) != 0 && <div className="space-y-1">
                                <div className="flex justify-between">
                                    <p> Credit Code </p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="font-bold text-neutral-600"> {order.creditNote[0].creditCode} </p>
                                    <p> {convertStringToINR(Number(order.creditNote[0].value))} </p>
                                </div>
                            </div> }
                        </div>
                        <div className="flex flex-col space-y-2 ">
                            <div className="space-y-1">
                                { order.returnItems.map((product, index) => (
                                    <div key={index} className="flex flex-col text-xs text-neutral-500" >
                                        <div className="flex flex-row space-x-3">
                                            <Image className="rounded-sm" src={`${product.orderProduct.productVariant.product.productImages[0].image}`} alt="product image" width={70} height={40} sizes="100vw"/>
                                            <div className="flex flex-col justify-center space-y-1">
                                                <p>{product.orderProduct.productVariant.product.name.toUpperCase()} ( {product.orderProduct.productVariant.size} )</p>
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