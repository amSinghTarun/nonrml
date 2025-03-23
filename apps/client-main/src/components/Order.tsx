"use client"
import { cn } from "@/lib/utils";
import { RouterOutput } from "@/app/_trpc/client";
import Image from "next/image";
import { useState } from "react";
import { MakeReturn } from "./MakeReturn";
import { MakeExchange } from "./MakeExchange";
import React from "react";
import { useRouter } from "next/navigation";
import { GeneralButtonTransparent } from "./ui/buttons";
import { toast } from "@/hooks/use-toast";

type OrderDetails = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

interface OrderProps {
    className?: string,
    orderDetails: OrderDetails
}

const getOrderProgressMessage = (status: string, date?:number) => {
    switch (status) {
        case "ACCEPTED":
            return "Your Order Is Being Packed With Care";
        case "SHIPPED":
            return "Your Order Is On Its Way";
        case "DELIVERED":
            return `Order Delivered on ${(new Date(date!).toDateString())}`;
        case "PAYMENT_FAILED":
            return `Payment failed`;
        default:
            return "Order Processing";
    }
};

const getOrderPaymentStatus = (status: string) => {
    switch (status) {
        case "paid":
            return "Complete";
        case "failed":
            return "Failed";
        case "COD":
            return "Pending";
        default:
            return "Failed";
    }
};

export const Order : React.FC<OrderProps> = ({orderDetails, className}) => {
    const [showReturnReplace, setShowReturnReplace] = useState<"RETURN"|"EXCHANGE"|"ORIGINAL">("ORIGINAL");
    console.log(orderDetails)
    const router = useRouter();

    return (
        <div className={cn("h-full w-full p-4 lg:p-20", className)}>
            { showReturnReplace == "RETURN" &&  <MakeReturn returnAcceptanceDate={Number(orderDetails.returnAcceptanceDate)}  products={orderDetails!.orderProducts!} orderId={orderDetails!.id} backToOrderDetails={()=>{setShowReturnReplace("ORIGINAL")}}/>}
            { showReturnReplace == "EXCHANGE" &&  <MakeExchange returnAcceptanceDate={Number(orderDetails.returnAcceptanceDate)} products={orderDetails!.orderProducts!} orderId={orderDetails!.id} backToOrderDetails={()=>{setShowReturnReplace("ORIGINAL")}}/>}
            { showReturnReplace == "ORIGINAL" && <div className="space-y-7 lg:space-y-10 h-full">
                
                <div className="text-sm text-start lg:text-base font-medium">
                    <p> {orderDetails?.id} </p>
                </div>

                
                <div className="space-y-7 lg:space-y-0 flex flex-col lg:flex-row justify-between">

                    <div className="flex text-xs lg:w-1/3 flex-col justify-center space-y-1 text-neutral-500">
                        <div className="flex justify-between">
                            <p> Purchase On </p>
                            <p> {orderDetails?.createdAt.toDateString()} </p>
                        </div>
                        <div className="flex justify-between">
                            <p>{`${orderDetails.productCount} Item${orderDetails.productCount>1 ? 's' : ""}`} </p>
                            <p> {convertStringToINR(+orderDetails?.totalAmount! - (orderDetails.creditUtilised || 0) )} </p>
                        </div>
                        <div className="flex justify-between">
                            <p>Payment</p>
                            <p>{getOrderPaymentStatus(orderDetails.Payments?.paymentStatus ?? "")} </p>
                        </div>
                        <p className="text-xs font-normal text-neutral-500 lg:text-sm pt-6 lg:pt-10"> {`${getOrderProgressMessage(orderDetails?.orderStatus, Number(orderDetails.deliveryDate))}`}</p>
                    </div>

                    <div className="flex">
                        {orderDetails.orderStatus == "SHIPPED" && <div className=" text-xs text-neutral-600 ">
                            <GeneralButtonTransparent onClick={() => {}} className=" text-neutral-500 border w-fit hover:text-neutral-800 p-2 cursor-pointer" 
                                display="TRACK ORDER"
                                />
                        </div>}
                        { orderDetails.orderStatus == "DELIVERED" && <div className=" text-xs flex lg:text-sm space-x-7 text-neutral-600">
                            { ( (Number(orderDetails?.returnAcceptanceDate) || 0) + 1000*60*60*24*500 ) > Date.now() && <div className=" text-xs text-neutral-600">
                                    <GeneralButtonTransparent className=" w-fit p-2" onClick={()=>{!orderDetails?.return.length ? setShowReturnReplace("RETURN") : toast({variant:"default", title: "You can't request a new return until the last one is processed.", duration: 4000 })}}
                                        display="RETURN"
                                    />
                                </div>
                            }
                            { ( (Number(orderDetails?.returnAcceptanceDate) || 0) + 1000*60*60*24*500) > Date.now() && <div className=" text-xs text-neutral-600">
                                    <GeneralButtonTransparent className="w-fit p-2" onClick={()=>{!orderDetails?.replacementOrder.length ? setShowReturnReplace("EXCHANGE") : toast({variant:"default", title: "You can't request a new exchange until the last one is processed.", duration: 4000 })}}
                                        display="EXCHANGE"
                                    />
                                </div>
                            }
                        </div>}
                    </div>

                </div>

                <div className="flex flex-col space-y-2 lg:w-1/2">
                    { orderDetails?.orderProducts.map((product, index) => {
                        return (
                            <div key={index} className="relative justify-between flex flex-col text-xs rounded-md " >
                                <div className="flex flex-row space-x-3">
                                    <Image 
                                        src={`${product.productVariant.product.productImages[0].image}`} 
                                        alt="product image" 
                                        width={0}
                                        height={0} 
                                        sizes="100vw"
                                        className={` w-28 sm:w-40 object-contain rounded-md cursor-pointer hover:shadow-md hover:shadow-neutral-500 `}
                                        onClick={ () => router.push(`/products/${product.productVariant.product.sku.toLowerCase()}`)}
                                    />
                                    <div className="flex flex-col flex-1 pt-2 space-y-1 text-[11px] lg:text-xs text-neutral-500">
                                        <p>{`${product.productVariant?.product.name.toUpperCase()} ( ${product.productVariant?.size} )`}</p>
                                        <p>{convertStringToINR(+product.price)}</p>
                                        <p>{`${product.quantity} Piece${product.quantity > 1 ? 's' : ""}`} </p>
                                        { product.rejectedQuantity ? <p>{`${product.rejectedQuantity} Piece${product.rejectedQuantity > 1 ? 's' : ""} Cancelled`}</p> : <></>}
                                    </div>
                                </div>
                            </div>
                        )
                    })} 
                </div>

                <div className="flex flex-col lg:flex-row space-y-7 lg:space-y-0 justify-between">

                    <div className=" flex flex-col basis-1/2 text-xs text-neutral-500 space-y-1">
                        <p className="text-neutral-400"> SHIPPING ADDRESS </p>
                        <p >{orderDetails?.address.contactName.toLocaleUpperCase()}</p>
                        <p >{orderDetails?.address.location}, {orderDetails?.address.pincode}</p>
                        <p >{orderDetails?.address.city.toUpperCase()} {orderDetails?.address.state.toUpperCase()}</p>
                        <p>{orderDetails?.address.countryCode} {orderDetails?.address.contactNumber}</p>
                        <p >{orderDetails?.address.email}</p>
                    </div>    

                    <div className="flex text-xs lg:basis-1/3 flex-col space-y-1 text-neutral-500">
                        <p className="text-neutral-400"> SUMMARY </p>
                        <div className="flex justify-between">
                            <p>{`${orderDetails.productCount} Item${orderDetails.productCount>1 ? 's' : ""}`} </p>
                            <p> {convertStringToINR(+orderDetails?.totalAmount!)} </p>
                        </div>
                        <div className="flex justify-between">
                            <p>Credit Note</p>
                            <p>{orderDetails.creditNote?.creditCode || "---"}</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Credit Utilized</p>
                            <p> {convertStringToINR(orderDetails.creditUtilised || 0)} </p>
                        </div>
                        <div className="flex justify-between">
                            <p>Gross Total</p>
                            <p className="text-neutral-700">{convertStringToINR(+orderDetails?.totalAmount! - (orderDetails.creditUtilised || 0) )}</p>
                        </div>
                    </div> 
                </div>

            </div> }
        </div>
    )
}
    