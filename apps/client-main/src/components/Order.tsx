"use client"
import { cn } from "@/lib/utils";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MakeReturn } from "./MakeReturn";
import { MakeExchange } from "./MakeExchange";
import React from "react";
import { useRouter } from "next/navigation";

type OrderDetails = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

interface OrderProps {
    className?: string,
    orderDetails: OrderDetails
}

export const Order : React.FC<OrderProps> = ({orderDetails, className}) => {
    const [showReturnReplace, setShowReturnReplace] = useState<"RETURN"|"EXCHANGE"|"ORIGINAL">("ORIGINAL");
    const router = useRouter();
    return (
        <div className={cn("rounded-xl overflow-y-scroll bg-white/10  h-full w-full p-2 ", className)}>
        { showReturnReplace == "RETURN" &&  <MakeReturn makeNewReturn={orderDetails?.return.length ? false : true} products={orderDetails!.orderProducts!} orderId={orderDetails!.id} backToOrderDetails={()=>{setShowReturnReplace("ORIGINAL")}}/>}
        { showReturnReplace == "EXCHANGE" &&  <MakeExchange makeNewExchange={orderDetails?.replacementOrder.length ? false : true} products={orderDetails!.orderProducts!} orderId={orderDetails!.id} backToOrderDetails={()=>{setShowReturnReplace("ORIGINAL")}}/>}
        { showReturnReplace == "ORIGINAL" && <div className="space-y-8 h-full">
                <div className="flex flex-col justify-between space-y-2 pb-8 text-sm relative border-b border-black/80 border-dotted">
                    <div className="flex justify-between">
                        <p className="font-medium"> Order Id : </p>
                        <p> {orderDetails?.id} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium"> Products : </p>
                        <p> {orderDetails?.productCount} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium"> Order Value : </p>
                        <p> {convertStringToINR(+orderDetails?.totalAmount!)} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium"> Payment Status : </p>
                        <p> {orderDetails?.payment?.paymentStatus} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium"> Order Status : </p>
                        <p> {orderDetails?.orderStatus} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium"> Purchase Date : </p>
                        <p> {orderDetails?.createdAt.toDateString()} </p>
                    </div>
                    <div className="space-y-1 p-2 backdrop-blur-3xl flex flex-col text-sm shadow-sm shadow-black/15 rounded-xl ">
                        <p className="font-medium"> Delivery Address : </p>
                        <p className="flex flex-row">{`${orderDetails?.address.contactName.toLocaleUpperCase()}, ${orderDetails?.address.location}, ${orderDetails?.address.pincode}`}</p>
                        <p className="flex flex-row" >{orderDetails?.address.email}</p>
                        <p>{orderDetails?.address.contactNumber}</p>
                    </div>
                    { <div className="flex flex-row text-xs sm:text-sm justify-around items-center absolute w-full -bottom-4">
                            { orderDetails?.orderStatus == "DELIVERED" && <div 
                                    className="rounded-2xl bg-black p-2 px-5 justify-center flex text-white"
                                >DELIVERED</div>
                            }
                            { orderDetails?.orderStatus == "ACCEPTED" && <Link 
                                    href={`/orderId=${orderDetails?.shipmentId}`} 
                                    className="rounded-2xl bg-black p-2 px-5 justify-center flex text-white hover:bg-white hover:text-black"
                                >{`SHIPPING SOON :)`}</Link>
                            }
                            { orderDetails?.orderStatus == "SHIPPED" && <Link 
                                    href={`/orderId=${orderDetails?.shipmentId}`} 
                                    className="rounded-2xl bg-black p-2 px-5 justify-center flex text-white hover:bg-white hover:text-black"
                                >TRACK ORDER</Link>
                            }
                    </div> }
                </div>
                <div className="flex flex-col space-y-2"> 
                <div className="flex flex-row text-lg pb-1">
                    <p className="font-medium flex flex-grow">Products</p>
                    <div className="flex divide-x-2 divide-black text-sm items-center">
                        { 
                         ( (Number(orderDetails?.deliveryDate) ?? 0) + 1000*60*60*24*500) > Date.now() && 
                            <div className="flex px-2 py-1 hover:text-white hover:rounded-l-xl cursor-pointer hover:bg-black" onClick={()=>{setShowReturnReplace("RETURN")}}>RETURN</div>
                        }
                        { 
                        ( (Number(orderDetails?.deliveryDate) ?? 0) + 1000*60*60*24*500) > Date.now() && 
                            <div className="flex px-2 py-1 hover:text-white hover:rounded-r-xl cursor-pointer hover:bg-black" onClick={()=>{setShowReturnReplace("EXCHANGE")}}>EXCHANGE</div>
                        }
                        </div>
                    </div>
                    { orderDetails?.orderProducts.map((product, index) => {
                        console.log(product.productVariant.product)
                        return (
                            <div key={index}
                                className="relative justify-between backdrop-blur-3xl flex flex-col text-xs shadow-sm shadow-black/15 p-2 rounded-xl"
                            >
                            <div className="flex flex-row space-x-3">
                                <Image 
                                    src={`${product.productVariant.product.productImages[0].image}`} 
                                    alt="product image" 
                                    width={60} 
                                    height={40} 
                                    sizes="100vw"
                                    className="rounded-xl cursor-pointer hover:shadow-sm hover:shadow-black"
                                    onClick={ () => router.push(`/products/${product.productVariant.product.sku.toLowerCase()}`)}
                                />
                                <div className="flex flex-col flex-1 justify-center space-y-1">
                                    <p>{`${product.productVariant?.product.name.toUpperCase()} ( ${product.productVariant?.size} )`}</p>
                                    <p>{convertStringToINR(+product.price)}</p>
                                    <p>Total Quantity: {product.quantity}</p>
                                    { product.rejectedQuantity! > 0 && <p>Cancelled Quantity: {product.rejectedQuantity}</p> }
                                </div>
                            </div>
                        </div>
                        )
                    })
                } </div>
            </div>}
        </div>
    )
}
    