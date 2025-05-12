"use client"

import React, { useEffect, useRef, useState } from "react";
import CanclePurchaseDialog from "@/components/dialog/CancelPurchaseDialog";
import { AddressCard } from "@/components/cards/AddressCard"
import { cn } from "@nonrml/common";
import { AddAddress, EditAddress } from "./Address";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { useBuyNowItemsStore, useCartItemStore } from "@/store/atoms";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { displayRazorpay } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";
import QuantityChangeDialog from "./dialog/QuantityChangeDialog";
import { GeneralButton, GeneralButtonTransparent } from "./ui/buttons";
import Loading from "@/app/loading";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { convertStringToINR } from "@/lib/utils";

interface CheckoutProp {
    className?: string,
    buyOption: string|null,
}

export const Checkout = ({className, buyOption }: CheckoutProp) => {
    
    const router = useRouter();
    const { buyNowItems, setBuyNowItems } = useBuyNowItemsStore()
    const { cartItems, setCartItems } = useCartItemStore();
    const orderProducts = !buyOption ? cartItems : buyNowItems;
    const initiateOrder = trpc.viewer.orders.initiateOrder.useMutation();
    
    if(Object.keys(orderProducts).length == 0 && !initiateOrder.isLoading)
        router.back();
    
    const { toast } = useToast();
    const couponCode = useRef("");
    const [ quantityChange, setQuantityChange ] = useState(false);
    const [ applyCoupon, setApplyCoupn ] = useState(false);
    const couponDisplay = useRef<"APPLY COUPON" | "CLOSE" | "REMOVE">("APPLY COUPON");
    const [couponValue, setCouponValue] = useState<{orderValue:number, couponValue: number}|null>();
    
    const [totalAmount, setTotalAmount] = useState(0);
    useEffect(() => {
      // Calculate total amount
      let newTotal = 0;
      Object.values(orderProducts).map((orderProduct) => {
        newTotal += orderProduct.price * orderProduct.quantity;
      });
      setTotalAmount(newTotal);
    }, [cartItems, buyNowItems, orderProducts]);

    const updatePaymentStatus = trpc.viewer.payment.updateFailedPaymentStatus.useMutation();
    const verifyOrder = trpc.viewer.orders.verifyOrder.useMutation({
      onSuccess: (response) => {
        router.replace(`/orders/${response.data.orderId}`);
      },
      onError: () => {
        toast({
            duration: 3000,
            title: "Something went wrong. Any payment deducted will be reimbursed",
            variant: "destructive"
        });
        router.replace("/orders");
      }
    });
    const getCreditNoteDetails = trpc.useUtils().viewer.creditNotes.getCreditNote;
    
    useEffect( () => {
        // Set timeout to end page session after 10 mins
        const timer = setTimeout(() => {
            router.back();
        }, 600000);
        
        // Cleanup function
        return () => clearTimeout(timer);
    }, [router])


    const handlePayment = async () => {
        try{

            const {data: data} = await initiateOrder.mutateAsync({orderProducts: orderProducts, creditNoteCode: couponCode.current })
            if(data.updateQuantity){
                setQuantityChange(true);
                !buyOption ? setCartItems(data.insufficientProductQuantities) : setBuyNowItems(data.insufficientProductQuantities);
                return;
            }
            
            if (data.orderId){
                console.log("OPEN RAZORPAY");
                await displayRazorpay({
                    rzpOrder: { orderId: data.orderId!, amount: data.amount!, rzpOrderId: data.rzpOrderId },
                    cartOrder: !buyOption ? true : false,
                    updatePaymentStatus: updatePaymentStatus.mutate,
                    verifyOrder: verifyOrder.mutate,
                });
                return;
            }

            throw new Error("Something went wrong. Please try again !!")

        } catch(error: any) {
            toast({
                duration: 3000,
                title: "Something went wrong. Please try again !!",
                variant: "destructive"
            });
            router.back();
        }
    }

    const handleApplyCreditNote = async () => {
        try{
            const creditNoteApplied = await getCreditNoteDetails.fetch({creditNote:couponCode.current, orderValue:totalAmount});
            setCouponValue({orderValue: creditNoteApplied?.data.afterCnOrderValue!, couponValue:creditNoteApplied?.data.usableValue!});
        } catch(error:any){
            toast({
                duration: 1500,
                title: error.message,
                variant: "destructive"
            });
        }
    }

    return (
        <div className={cn("h-screen w-full p-2 ", className)}>
            { initiateOrder.isLoading || verifyOrder.isLoading ? 
                <Loading  text="PROCESSING YOUR PAYMENT..."/> : 
                <>
                <QuantityChangeDialog open={quantityChange} cancelPurchase={() => { router.back() }} continuePurchase={() => { setQuantityChange(false) }} /> {/* ; setAction("ORDER") */}
                <div className="w-[100%] h-[100%] flex flex-col text-neutral-800">
                { <article className="flex flex-row justify-between px-3 py-2 space-x-1 items-center ">
                    <div className=" cursor-pointer text-xs font-bold">
                        <span className={`${"font-bold"}`} >{`ORDER SUMMARY`}</span>
                    </div>

                </article>}

                    <div className="w-full h-[70%] space-y-2 p-2 overflow-y-scroll">{
                        Object.keys(orderProducts).map((variantId, index) => (
                            <div 
                                className=" space-x-3 flex flex-row text-[10px] md:text-xs shadow-sm shadow-neutral-100 p-1  rounded-md"
                                key={index}
                            >
                                <Image 
                                    src={`${orderProducts[+variantId].productImage}`} 
                                    alt="product image" 
                                    width={90} 
                                    height={10} 
                                    sizes="100vw"
                                    className="rounded-sm"
                                />
                                <div className="flex flex-col justify-center space-y-1 text-neutral-500">
                                    <p>{orderProducts[+variantId].productName.toUpperCase()}</p>
                                    <p>{convertStringToINR(orderProducts[+variantId].price)}</p>
                                    <p>Size: {orderProducts[+variantId].size}</p>
                                    <p>Quantity: {orderProducts[+variantId].quantity}</p>
                                </div>
                            </div>
                        ))
                    }</div>
                {
                    applyCoupon && 
                    <article className="flex flex-row justify-between px-3 py-4 gap-5 items-center">
                        <input 
                            onChange={(e) => (couponCode.current = e.target.value)}
                            placeholder="Paste your coupon code here"
                            className="placeholder:text-neutral-500 placeholder:text-xs text-neutral-800 text-sm outline-none items-center rounded-md w-full h-full py-2"
                        />
                        {
                            couponValue ?
                                <div className="basis-1/3 text-xs font-normal w-full h-full ">
                                    <GeneralButtonTransparent
                                        className=" w-full h-full text-[10px] p-1 px-2 border border-neutral-200 text-neutral-400 hover:text-neutral-700"
                                        onClick={()=> { setCouponValue(null)}} 
                                        display="REMOVE"
                                    /> 
                                </div>
                            : 
                                <div className="basis-1/3 text-xs font-normal w-full h-full ">
                                    <GeneralButtonTransparent
                                        className=" w-full h-full text-[10px] p-1 px-2 border border-neutral-200 text-neutral-400 hover:text-neutral-700"
                                        onClick={async ()=> { await handleApplyCreditNote()}}
                                        display="APPLY"
                                    />
                                </div>
                        }
                    </article>
                }
                <article className="flex flex-row justify-between px-3 py-3 space-x-1 items-center">
                    <div className=" cursor-pointer text-xs hover:font-bold text-neutral-600">
                        <span className={`${"font-bold"}`}>{`HAVE A COUPON CODE?`}</span>
                    </div>
                    {
                        couponValue ? 
                        <div className="basis-1/3 text-xs sm:text-md text-center">
                            <span className={`font-bold`}>{`Credit: ${convertStringToINR(couponValue.couponValue)}`}</span>
                        </div>
                        : 
                        <div className="font-normal text-xs w-fit h-full">
                            <GeneralButtonTransparent
                                className=" w-full h-full text-[10px] p-2 px-4 border border-neutral-200 text-neutral-400 hover:text-neutral-700"
                                onClick={()=> {
                                    couponDisplay.current = applyCoupon ? "APPLY COUPON" : "CLOSE"
                                    setApplyCoupn(!applyCoupon)
                                }} 
                                display={couponDisplay.current} 
                            />
                        </div>
                    }
                </article>

                <article className="text-sm flex flex-row justify-between px-2 pt-4 pb-2 space-x-1">
                    <div className="flex flex-col basis-1/2 justify-start">
                        <span className="text-xs text-neutral-500">TOTAL:</span>
                        <span className="text-lg font-bold">{convertStringToINR(couponValue?.orderValue ?? totalAmount)}</span>
                    </div>
                    <div className=" w-fit h-full">
                        <GeneralButton className=" p-2 px-6 h-full w-full" display={ initiateOrder.isLoading ? "PROCESSING..." : "PAY NOW"} onClick={handlePayment} />
                    </div>
                </article>
            </div>
                </>
        }
        </div>
    )
};