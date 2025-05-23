"use client"
import { cn } from "@nonrml/common";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { convertStringToINR } from "@/lib/utils";

type ExchangeOrders = RouterOutput["viewer"]["replacement"]["getReplacement"]["data"];

interface ExchangesProps {
    className?: string,
    exchangeOrders: ExchangeOrders
}

export const Exchanges : React.FC<ExchangesProps> = ({ className, exchangeOrders }) => {
    return (
        <div className={cn("h-screen w-full p-2 pb-6 flex flex-col lg:flex-row", className)}>
            <h1 className="flex lg:flex-col text-base text-neutral-700 lg:basis-5/12 font-bold p-1 lg:justify-center lg:text-center">Replacement Orders</h1>
            <div className="space-y-7 lg:space-y-10 p-2 lg:p-4 flex flex-col flex-1 overflow-y-scroll overscroll-auto scrollbar-hide">
            {
                exchangeOrders.map((order, index) => {
                    return (
                        <div key={index} className="space-y-2 hover:shadow-sm w-full h-fit hover:shadow-neutral-200 shadow-sm shadow-neutral-100 p-2 text-xs rounded-md text-neutral-500">
                            <div className="flex flex-col justify-between space-y-1 relative">
                                <div className="flex justify-between">
                                    <p className="font-bold text-neutral-800">REPL-{order.id}</p>
                                    <p >{order.createdAt.toDateString()}</p>
                                </div>
                                <div className="flex justify-between ">
                                    <p className="">Exchange Status</p>
                                    <p>{order.status != "PENDING" ? order.status.replaceAll("_", " ") : order.return.returnStatus.replaceAll("_", " ")}</p>
                                </div>
                                {order.return.returnReceiveDate ? <div className="flex justify-between ">
                                    <p className="">Return Received On</p>
                                    <p>{order.return.returnReceiveDate.toDateString()}</p>
                                </div> : <></>}
                                {order.shipmentId && order.status != "DELIVERED" && (
                                    <div className="flex justify-end mt-1">
                                        <Link 
                                            href={`/orderId=${order.shipmentId}`} 
                                            className="text-xs text-neutral-600 underline"
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                )}
                                { Number(order.CreditNotes) != 0 && <div className="space-y-1">
                                <div className="flex justify-between">
                                    <p> Credit Code </p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="font-bold text-neutral-600"> {order.CreditNotes[0].creditCode} </p>
                                    <p> {convertStringToINR(Number(order.CreditNotes[0].value))} </p>
                                </div>
                            </div> }
                            </div>
                            <div className="flex flex-col space-y-2">
                                {order.replacementItems.map((product, index) => (
                                    <div key={index} className="flex flex-col text-xs">
                                        <div className="flex flex-row space-x-3">
                                            <Image 
                                                className="rounded-sm" 
                                                src={`${product.returnOrderItem.orderProduct.productVariant.product.productImages[0].image}`} 
                                                alt="product image" 
                                                width={80} 
                                                height={50} 
                                                sizes="100vw"
                                            />
                                            <div className="flex flex-col flex-1 justify-center space-y-1 text-neutral-500">
                                                <div className="flex justify-between flex-row">
                                                    <p>{product.returnOrderItem.orderProduct.productVariant.product.name.toUpperCase()} ( {product.returnOrderItem.orderProduct.productVariant.size} )</p>
                                                </div>
                                                <p className="text-neutral-300">Replacement Items</p>
                                                <div className="flex justify-between flex-row">
                                                    <p className="flex">Size: {product.productVariant.size}</p>
                                                    <p className="flex">Quantity: {product.returnOrderItem.quantity}</p>
                                                </div>
                                                {product.nonReplacableQuantity ? <p>Non-Replaceable Quantity: {product.nonReplacableQuantity}</p> : <></>}
                                                {product.returnOrderItem.rejectedQuantity ? <p>Rejected Quantity: {product.returnOrderItem.rejectedQuantity}</p> : <></>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}