"use client"

import React, { useEffect, useRef, useState } from "react";
import CanclePurchaseDialog from "@/components/dialog/CancelPurchaseDialog";
import { AddressCard } from "@/components/cards/AddressCard"
import { cn } from "@/lib/utils";
import { deleteAddress } from "@/app/actions/address.action";
import { AddAddress, EditAddress } from "./Address";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { useBuyNowItemsStore, useCartItemStore } from "@/store/atoms";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { displayRazorpay } from "@/lib/payment";
import { useToast } from "@/hooks/use-toast";
import { initiateOrder } from "@/app/actions/order.actions";
import { applyCreditNote } from "@/app/actions/creditNotes.action";
import QuantityChangeDialog from "./dialog/QuantityChangeDialog";
import { GeneralButton } from "./ui/buttons";
import Loading from "@/app/loading";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";

type AddressesTRPCOutput = RouterOutput["viewer"]["address"]["getAddresses"]["data"]

interface AddressProps {
    className?: string,
    buyOption: string|null,
    userAddresses: UseTRPCQueryResult<RouterOutput["viewer"]["address"]["getAddresses"], unknown>
}

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

export const Checkout = ({className, buyOption, userAddresses}: AddressProps) => {
    
    const { toast } = useToast();
    const [ selectedAddress, setSelectedAddress ] = useState<AddressesTRPCOutput[number]>();
    const [ applyCoupon, setApplyCoupn ] = useState(false);
    const [ action, setAction ] = useState<"ADDADDRESS"|"EDITADDRESS"|"ORDER"|"SHOWADDRESS">("SHOWADDRESS");
    const couponDisplay = useRef<"HAVE COUPON" | "CLOSE" | "REMOVE">("HAVE COUPON");
    const [couponValue, setCouponValue] = useState<{orderValue:number, couponValue: number}|null>();
    const { cartItems, setCartItems } = useCartItemStore();
    const { buyNowItems, setBuyNowItems } = useBuyNowItemsStore()
    const [ quantityChange, setQuantityChange ] = useState(false);
    const [ orderInProcess, setOrderInProcess ] = useState(false);

    const router = useRouter();
    const couponCode = useRef("");
    const totalAmount = useRef(0);

    const handleAddressEdit = (address: AddressesTRPCOutput[number]) => {
        setSelectedAddress(address);
        setAction("EDITADDRESS");
    }

    const orderProducts = !buyOption ? cartItems : buyNowItems;
    console.log("ORDER_IN_PROCESS", orderInProcess);
    if(Object.keys(orderProducts).length == 0 && !orderInProcess)
        router.back();

    useEffect( () => {
        totalAmount.current = 0;
        Object.values(orderProducts).map((orderProduct) => {
            totalAmount.current += orderProduct.price * orderProduct.quantity;
        })
    });

    // to end the page session after 10 mins
    useEffect(() => {
        const timer = setTimeout(() => {
          router.back();
        }, 600000);
        return () => clearTimeout(timer);
    }, [router]);

    const onDismissHandler = () => setOrderInProcess(false);

    const handlePayment = async () => {
        try{
            if(!selectedAddress) {
                toast({
                    duration: 1500,
                    title: "Please Select An Address"
                });
                return
            }
            setOrderInProcess(true);
            const data = await initiateOrder({orderProducts: orderProducts, addressId: selectedAddress?.id!, creditNoteCode: couponCode.current });
            if(data.updateQuantity){
                setQuantityChange(true);
                setOrderInProcess(false);
                !buyOption ? setCartItems(data.insufficientProductQuantities) : setBuyNowItems(data.insufficientProductQuantities);
                return;
            }
            displayRazorpay({rzpOrder: data, cartOrder: !buyOption ? true : false, onDismissHandler: onDismissHandler});
            return;
        } catch(error: any) {
            setOrderInProcess(false);
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
            const creditNoteApplied = await applyCreditNote(couponCode.current, totalAmount.current);
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
        <div className={cn("rounded-xl bg-white/10 backdrop-blur-3xl h-full w-full p-2", className)}>
            < CanclePurchaseDialog />
            { orderInProcess ? 
                <Loading  text="PROCESSING YOUR PAYMENT..."/> : 
                <>
                <QuantityChangeDialog open={quantityChange} cancelPurchase={() => { router.back() }} continuePurchase={() => { setQuantityChange(false); setAction("ORDER") }} />
                <div className="divide-white/40 divide-y w-[100%] h-[100%] flex flex-col">
                {action == "ADDADDRESS" && <AddAddress onCancelClick={()=>{userAddresses.refetch(), setAction("SHOWADDRESS")}}/>}
                {action =="EDITADDRESS" && selectedAddress && <EditAddress address={selectedAddress} onCancelClick={()=>{userAddresses.refetch(), setAction("SHOWADDRESS")}}/>}
                {action == "SHOWADDRESS" && (
                    userAddresses.isLoading ? (
                        <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                            <div className="backdrop-blur-3xl bg-white/20 p-4 font-medium rounded-xl text-sm">
                                <p>FINDING YOUR ADDRESS FOR YOU .....</p>
                            </div>
                        </article>
                    ) : userAddresses.isError ? (
                        <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                            <div className="backdrop-blur-3xl bg-white/20 p-4 font-medium rounded-xl text-sm">
                                <p>Error loading addresses. Please try again.</p>
                            </div>
                        </article>
                    ) : (
                        userAddresses.data && userAddresses.data?.data.length === 0 ? (
                            <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                            <div className="backdrop-blur-3xl bg-white/20 p-4 font-medium rounded-xl text-sm">
                                <p>NO ADDRESS FOUND</p>
                                <p className="text-xs">PLEASE ADD ONE TO CONTINUE WITH PURCHASE</p>
                            </div>
                        </article>
                    ) :
                        <div className="w-full h-full space-y-2 p-2 overflow-y-scroll">
                            {
                                userAddresses.data?.data.map((address, index) => (
                                    <AddressCard 
                                        selected={selectedAddress?.id}
                                        key={index}
                                        name={address.contactName} 
                                        address={address.location}
                                        email={address.email}
                                        mobile={address.contactNumber}
                                        pincode={address.pincode}
                                        onEdit={()=>{handleAddressEdit(address)}}
                                        onDelete={()=>{
                                            userAddresses.data.data.slice(index, 1),
                                            deleteAddress(address.id).then( () => {
                                                setAction("SHOWADDRESS")
                                            })
                                        }}
                                        id={address.id}
                                        onSelect={() => setSelectedAddress(address)}
                                        className={`${selectedAddress?.id == address.id && "border border-black"}`}
                                    />
                                ))
                            }
                        </div>
                    )
                )}
                {action == "ORDER" && (
                    <div className="w-full h-full space-y-2 p-2 overflow-y-scroll">{
                        Object.keys(orderProducts).map((variantId, index) => (
                            <div 
                                className=" space-x-3 backdrop-blur-3xl flex flex-row text-sm shadow-sm shadow-black/15 p-2 rounded-xl"
                                key={index}
                            >
                                <Image 
                                    src={`${orderProducts[+variantId].productImage}`} 
                                    alt="product image" 
                                    width={70} 
                                    height={50} 
                                    sizes="100vw"
                                    className="rounded-xl"
                                />
                                <div className="flex flex-col">
                                    <div className="flex flex-row">{orderProducts[+variantId].productName.toUpperCase()}</div>
                                    <div className="flex flex-row">{convertStringToINR(orderProducts[+variantId].price)}</div>
                                    <div className="flex flex-row">Size: {orderProducts[+variantId].size}</div>
                                    <div className="flex flex-row">Quantity: {orderProducts[+variantId].quantity}</div>
                                </div>
                            </div>
                        ))
                    }</div>
                )}
                <article className="flex flex-row justify-between px-3 py-3 space-x-1 items-center">
                    <div className=" cursor-pointer text-md p-1 font-medium">
                        <span className={`${action == "SHOWADDRESS" && "underline font-bold"}`} onClick={()=>{setAction("SHOWADDRESS")}}>{`Shipping Address`}</span>
                    </div>
                    <div className="basis-1/3 text-xs font-normal w-full h-full ">
                        <GeneralButton 
                            display="ADD ADDRESS" 
                            className="bg-none w-full h-full shadow-0" 
                            onClick={()=> {setAction("ADDADDRESS")}} 
                        />
                    </div>
                </article>
                {
                    applyCoupon && 
                    <article className="flex flex-row justify-between px-3 py-3 gap-3 items-center">
                        <div className=" basis-2/3 cursor-pointer text-md font-medium w-full bg-transparent">
                            <input 
                                onChange={(e) => (couponCode.current = e.target.value)}
                                placeholder="Paste your coupon code here"
                                className="placeholder:text-black/60 justify-center bg-transparent backdrop-blur-3xl text-black font-normal text-sm outline-none items-center rounded-xl w-full h-full p-2"
                            />
                        </div>
                        {
                            couponValue ?
                                <div className="basis-1/3 text-xs font-normal w-full h-full ">
                                    <GeneralButton display="REMOVE" className="bg-black text-white w-full h-full  shadow-0" onClick={()=> { setCouponValue(null)}} /> 
                                </div>
                            : 
                                <div className="basis-1/3 text-xs font-normal w-full h-full ">
                                    <GeneralButton display="APPLY" className="bg-none w-full h-full  shadow-0" onClick={async ()=> { await handleApplyCreditNote()}} /> 
                                </div>
                        }
                    </article>
                }
                <article className="flex flex-row justify-between px-3 py-3 space-x-1 items-center">
                    <div className=" cursor-pointer text-md p-1 font-medium">
                        <span className={`${action == "ORDER" && "underline font-bold"}`} onClick={()=>{setAction("ORDER")}}>{`Order summary *`}</span>
                    </div>
                    {
                        couponValue ? 
                        <div className="basis-1/3 text-sm sm:text-md text-center">
                            <span className={`font-bold`}>{`Credit: ${convertStringToINR(couponValue.couponValue)}`}</span>
                        </div>
                        : 
                        <div className="basis-1/3 font-normal text-xs w-full h-full">
                            <GeneralButton
                                display={couponDisplay.current} 
                                className="bg-none w-full h-full justify-end shadow-0" 
                                onClick={()=> {
                                    couponDisplay.current = applyCoupon ? "HAVE COUPON" : "CLOSE"
                                    setApplyCoupn(!applyCoupon)
                                }} 
                                />
                        </div>
                    }
                </article>
                <article className="font-medium  text-sm flex flex-row justify-between px-2 pt-4 pb-2 space-x-1">
                    <div className="flex flex-col basis-1/2 justify-start">
                        <span className="text-xs">TOTAL:</span>
                        <span className="text-xl">{convertStringToINR(couponValue?.orderValue ?? totalAmount.current)}</span>
                    </div>
                    <div className="basis-1/2 w-[100%] h-full">
                        <GeneralButton className=" h-full w-full backdrop-blur-3xl bg-black text-white hover:bg-white hover:text-black hover:shadow-sm hover:shadow-black font-medium" display={ orderInProcess ? "PROCESSING..." : "PAY NOW"} onClick={handlePayment} />
                    </div>
                </article>
            </div>
                </>
        }
        </div>
    )
};