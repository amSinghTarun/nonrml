"use client"
import { cn } from "@/lib/utils";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import React from "react";
import Link from "next/link";

type ExchangeOrders = RouterOutput["viewer"]["replacement"]["getReplacement"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

interface ExchangesProps {
    className?: string,
    exchangeOrders: ExchangeOrders
}

export const Exchanges : React.FC<ExchangesProps> = ({ className, exchangeOrders }) => {
    return (
        <div className={cn("rounded-xl overflow-y-scroll bg-white/10 backdrop-blur-3xl h-full w-full p-2 ", className)}>
            <h1 className="flex flex-grow text-2xl font-bold p-1 k">Exchange(s)</h1>
            <div className="space-y-3">
            {
                exchangeOrders.map( (order, index) => {
                    return ( <div className="space-y-3 backdrop-blur-3xl shadow-sm shadow-black rounded-xl p-2">
                        <div className={`flex flex-col justify-between space-y-1 text-sm relative ${ (order.shipmentId && order.status != "DELIVERED") && "border-dotted border-b border-black pb-5" }`}>
                            <div className="flex justify-between">
                                <p className="font-medium"> Exchange Status : </p>
                                <p> {order.status != "PENDING" ? order.status : order.return.returnStatus } </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-medium"> Exchange Date : </p>
                                <p> {order.createdAt.toDateString()}</p>
                            </div>
                        { <div className="flex flex-row text-xs sm:text-sm justify-around items-center absolute w-full -bottom-4">
                            { (order.shipmentId && order.status != "DELIVERED")  && <Link 
                                    href={`/orderId=${order.shipmentId}`} 
                                    className="rounded-2xl bg-black p-2 px-5 justify-center flex text-white hover:bg-white hover:text-black"
                                >TRACK ORDER</Link>
                            }
                        </div> }
                        </div>
                        <div className="flex flex-col space-y-1">
                            <div className="text-xl font-medium">Products</div>
                            { order.replacementItems.map((product, index) => (
                                <div key={index}
                                    className="relative justify-between backdrop-blur-3xl flex flex-col text-xs shadow-sm shadow-black/15 p-2 rounded-xl"
                                >
                                    <div className="flex flex-row space-x-3 pb-2">
                                        <Image src={`${product.returnOrderItem.orderProduct.productVariant.product.productImages[0].image}`} alt="product image" width={70} height={40} sizes="100vw"/>
                                        <div className="flex flex-col flex-1 justify-between space-y-1">
                                            <p>{product.returnOrderItem.orderProduct.productVariant.product.name.toUpperCase()}</p>
                                            <p>Price: {Number(product.returnOrderItem.orderProduct.price)}</p>
                                            <p>Quantity: {product.returnOrderItem.quantity}</p>
                                            <p>Status: {product.returnOrderItem.status}</p>
                                            { product.replacementQuantity ? <p>Replaced Quantity: {product.replacementQuantity}</p> :  <></>}
                                        </div>
                                    </div>
                                    <div className="flex flex-row text-xs py-2 bg-white/25 rounded-xl">
                                        <p className="basis-1/2 text-center border-dotted border-black border-r"> Order Size: {product.returnOrderItem.orderProduct.productVariant.size}</p>
                                        <p className="basis-1/2 text-center"> Exchange Size: {product.productVariant.size}</p>
                                    </div>
                                    <div className=" flex text-center text-red-600 pt-2">
                                        { (product.returnOrderItem.acceptedQuantity! - product.replacementQuantity) > 0 ? <p>{`We regret to inform that we can only replace ${product.replacementQuantity} items. Amount of remainig quantities will be credit to your wallet :)`}</p> :  <></>}
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
    