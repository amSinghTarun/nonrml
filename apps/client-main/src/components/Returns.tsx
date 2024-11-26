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
    return (
        <div className={cn("rounded-xl overflow-y-scroll bg-white/10 backdrop-blur-3xl h-full w-full p-2 ", className)}>
            <h1 className="flex flex-grow text-2xl font-bold p-1 k">Return(s)</h1>
            <div className="space-y-3">
            {
                returnOrders.map( (order, index) => {
                    return ( <div className="space-y-3 backdrop-blur-3xl shadow-sm shadow-black rounded-xl p-2">
                        <div className="flex flex-col justify-between space-y-1 text-sm relative">
                            <div className="flex justify-between">
                                <p className="font-medium"> Return Status : </p>
                                <p> {order.returnStatus} </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-medium"> Return Payment Type : </p>
                                <p> {order.refundMode} </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-medium"> Return Date : </p>
                                <p> {order.createdAt.toDateString()}</p>
                            </div>
                            { order.returnStatus == "PROCESSED" && <div className="flex justify-between">
                                <p className="font-medium"> Return Amount : </p>
                                <p> {Number(order.refundAmount)} </p>
                            </div>}
                        </div>
                        <div className="flex flex-col space-y-2">
                            <div className="text-xl font-medium">Products</div>
                            { order.returnItems.map((product, index) => (
                                <div key={index}
                                    className="relative justify-between backdrop-blur-3xl flex flex-col text-xs shadow-sm shadow-black/15 p-2 rounded-xl"
                                >
                                    <div className="flex flex-row space-x-3">
                                        <Image src={`${product.orderProduct.productVariant.product.productImages[0].image}`} alt="product image" width={70} height={40} sizes="100vw"/>
                                        <div className="flex flex-col flex-1 justify-between space-y-1">
                                            <p>{product.orderProduct.productVariant.product.name.toUpperCase()}</p>
                                            <p>Quantity: {product.quantity}</p>
                                            <p>Status: {product.status}</p>
                                            <p>Price: {Number(product.orderProduct.price)}</p>
                                            <p>Size: {product.orderProduct.productVariant.size}</p>
                                            { product.acceptedQuantity ? <p>Rejected Quantity: {product.quantity - product.acceptedQuantity}</p> :  <></>}
                                        </div>
                                    </div>
                                </div>
                            ) ) }
                        </div>
                    </div> )
                })
            }
        </div>
            </div>
    )
}
    