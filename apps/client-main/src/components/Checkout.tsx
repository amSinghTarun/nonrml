"use client"

import React, { useEffect, useRef, useState } from "react";
import CanclePurchaseDialog from "@/components/dialog/CancelPurchaseDialog";
import { AddressCard } from "@/components/cards/AddressCard"
import { cn } from "@/lib/utils";
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
    
    const router = useRouter();
    const { buyNowItems, setBuyNowItems } = useBuyNowItemsStore()
    const { cartItems, setCartItems } = useCartItemStore();
    const orderProducts = !buyOption ? cartItems : buyNowItems;
    const initiateOrder = trpc.viewer.orders.initiateOrder.useMutation();
    
    if(Object.keys(orderProducts).length == 0 && !initiateOrder.isLoading)
        router.back();
    
    const { toast } = useToast();
    const couponCode = useRef("");
    const totalAmount = useRef(0);
    const [ quantityChange, setQuantityChange ] = useState(false);
    const [ selectedAddress, setSelectedAddress ] = useState<AddressesTRPCOutput[number]>();
    const [ applyCoupon, setApplyCoupn ] = useState(false);
    const [ action, setAction ] = useState<"ADDADDRESS"|"EDITADDRESS"|"ORDER"|"SHOWADDRESS">("SHOWADDRESS");
    const couponDisplay = useRef<"HAVE COUPON" | "CLOSE" | "REMOVE">("HAVE COUPON");
    const [couponValue, setCouponValue] = useState<{orderValue:number, couponValue: number}|null>();
    const deleteAddress = trpc.viewer.address.removeAddress.useMutation({
        onSuccess: () => {
            userAddresses.refetch()
        }
    });
    const updatePaymentStatus = trpc.viewer.payment.updateFailedPaymentStatus.useMutation();
    const verifyOrder = trpc.viewer.orders.verifyOrder.useMutation({
      onSuccess: (response) => {
        router.replace(`/account/${response.data.orderId}`);
      },
      onError: () => {
        toast({
            duration: 5000,
            title: "Something went wrong. Any payment deducted will be reimbursed",
            variant: "destructive"
        });
        router.replace("/account");
      }
    });
    const getCreditNoteDetails = trpc.useUtils().viewer.creditNotes.getCreditNote;

    const handleAddressEdit = (address: AddressesTRPCOutput[number]) => {
        setSelectedAddress(address);
        setAction("EDITADDRESS");
    }

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

    // const onDismissHandler = () => setOrderInProcess(false);

    const handlePayment = async () => {
        try{
            if(!selectedAddress) {
                toast({
                    duration: 1500,
                    title: "Please Select An Address"
                });
                return
            }
            // setOrderInProcess(true);

            // const data = await initiateOrder({orderProducts: orderProducts, addressId: selectedAddress?.id!, creditNoteCode: couponCode.current });
            const {data: data} = await initiateOrder.mutateAsync({orderProducts: orderProducts, addressId: selectedAddress?.id!, creditNoteCode: couponCode.current })
            if(data.updateQuantity){
                setQuantityChange(true);
                !buyOption ? setCartItems(data.insufficientProductQuantities) : setBuyNowItems(data.insufficientProductQuantities);
                return;
            }
            console.log("OPEN RAZORPAY");

            await displayRazorpay({
                rzpOrder: data, 
                cartOrder: !buyOption ? true : false,
                updatePaymentStatus: updatePaymentStatus.mutate,
                verifyOrder: verifyOrder.mutate,
            });

            return;

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
            const creditNoteApplied = await getCreditNoteDetails.fetch({creditNote:couponCode.current, orderValue:totalAmount.current});
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
        <div className={cn("h-screen w-full p-2 shadow-sm shadow-neutral-100 rounded-md", className)}>
            { initiateOrder.isLoading || verifyOrder.isLoading ? 
                <Loading  text="PROCESSING YOUR PAYMENT..."/> : 
                <>
                <QuantityChangeDialog open={quantityChange} cancelPurchase={() => { router.back() }} continuePurchase={() => { setQuantityChange(false); setAction("ORDER") }} />
                <div className="w-[100%] h-[100%] flex flex-col text-neutral-800">
                { action != "ORDER" && <article className="flex flex-row justify-between px-3 py-2 space-x-1 items-center ">
                    <div className=" cursor-pointer text-xs font-bold">
                        <span className={`${action == "SHOWADDRESS" && "font-bold"}`} onClick={()=>{setAction("SHOWADDRESS")}}>{`SHIPPING ADDRESS`}</span>
                    </div>
                    <div className=" font-normal w-fit h-full">
                        { action != "ADDADDRESS" && <GeneralButtonTransparent 
                            className=" w-full h-full text-[10px] p-2 px-4 border border-neutral-200 text-neutral-400 hover:text-neutral-700"
                            onClick={()=> {setAction("ADDADDRESS")}} 
                            display="ADD ADDRESS"
                        />}
                    </div>
                </article>}
                {action == "ADDADDRESS" && <AddAddress onCancelClick={()=>{userAddresses.refetch(), setAction("SHOWADDRESS")}}/>}
                {action =="EDITADDRESS" && selectedAddress && <EditAddress address={selectedAddress} onCancelClick={()=>{userAddresses.refetch(), setAction("SHOWADDRESS")}}/>}
                {action == "SHOWADDRESS" && (
                    <>
                        {userAddresses.isLoading ? (
                            <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                                <div className="p-4 font-bold text-xs">
                                    <p>FINDING YOUR ADDRESS FOR YOU .....</p>
                                </div>
                            </article>
                        ) : userAddresses.isError ? (
                            <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                                <div className="backdrop-blur-3xl bg-white/20 p-4 font-bold rounded-xl text-sm">
                                    <p>Error loading addresses. Please try again.</p>
                                </div>
                            </article>
                        ) : (
                            userAddresses.data && userAddresses.data?.data.length === 0 ? (
                                <article className="flex flex-row p-2 w-full h-full justify-center items-center">
                                <div className="text-xs text-neutral-500 text-center">
                                    <p>NO ADDRESS FOUND</p>
                                    <p className="text-xs">PLEASE ADD ONE TO CONTINUE WITH PURCHASE!</p>
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
                                                deleteAddress.mutate({id:address.id})
                                                userAddresses.data.data.splice(index, 1)
                                            }}
                                            deleting={deleteAddress.isLoading && address.id == deleteAddress.variables?.id}
                                            id={address.id}
                                            onSelect={() => setSelectedAddress(address)}
                                            className={`${selectedAddress?.id == address.id && "shadow-sm text-neutral-700 shadow-neutral-400"}`}
                                        />
                                    ))
                                }
                            </div>
                        )}
                    </>
                )}
                {action == "ORDER" && (
                    <div className="w-full h-full space-y-2 p-2 overflow-y-scroll">{
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
                )}
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
                        <span className={`${action == "ORDER" && "font-bold"}`} onClick={()=>{setAction("ORDER")}}>{`ORDER SUMMARY *`}</span>
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
                                    couponDisplay.current = applyCoupon ? "HAVE COUPON" : "CLOSE"
                                    setApplyCoupn(!applyCoupon)
                                }} 
                                display={couponDisplay.current} 
                            />
                        </div>
                    }
                </article>
                {   
                    action == "ORDER" && 
                    <article className="flex flex-row justify-between px-3 py-2 space-x-1 items-center text-neutral-600">
                        <div className=" cursor-pointer text-xs hover:font-bold">
                            <span onClick={()=>{setAction("SHOWADDRESS")}}>{`SHIPPING ADDRESS`}</span>
                        </div>
                        <div className=" font-normal w-fit h-full">
                            <GeneralButtonTransparent 
                                className=" w-full h-full text-[10px] p-2 px-4 border border-neutral-200 text-neutral-400 hover:text-neutral-700"
                                onClick={()=> {setAction("ADDADDRESS")}} 
                                display={"ADD ADDRESS"}
                            />
                        </div>
                    </article>
                }
                <article className="text-sm flex flex-row justify-between px-2 pt-4 pb-2 space-x-1">
                    <div className="flex flex-col basis-1/2 justify-start">
                        <span className="text-xs text-neutral-500">TOTAL:</span>
                        <span className="text-lg font-bold">{convertStringToINR(couponValue?.orderValue ?? totalAmount.current)}</span>
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