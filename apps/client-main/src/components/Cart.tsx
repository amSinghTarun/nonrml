"use client"

import React, { useState, useEffect } from "react";
import { GeneralButton, QuantitySelectButton } from "./ui/buttons";
import Image from "next/image";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRef } from "react";
import { useSetAppbarUtilStore, useCartItemStore } from "@/store/atoms";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { trpc } from "@/app/_trpc/client";
import { convertStringToINR } from "@/lib/utils";

export const CartMenu = () => {
  const cartItems = useStore(useCartItemStore, (state) => state.cartItems);
  const alterQuantity = useStore(useCartItemStore, (state) => state.alterQuantity);
  const removeCartProduct = useStore(useCartItemStore, (state) => state.removeProduct);
  const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
  const router = useRouter();
  let cartTotal = useRef(0);
  const updateCartQuantity = trpc.viewer.product.getProductVariantQuantity.useMutation();
  
  // Better scroll blocking without position fixed
  useEffect(() => {
    if (appbarUtil === "CART") {
      // Save original overflow
      const originalOverflow = document.body.style.overflow;
      const originalHeight = document.body.style.height;
      
      // Block scroll without changing position
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.height = originalHeight;
      };
    }
  }, [appbarUtil]);

  if(appbarUtil != "CART") return (<></>);

  const handleOnQuantityChange = (quantity: number, variantId:number) => {    
    try{
      console.log(quantity, variantId);
      (variantId in cartItems) && updateCartQuantity.mutate({productId: cartItems[variantId].productId})
      if(updateCartQuantity.isSuccess && updateCartQuantity.data && updateCartQuantity.data.data.productSizeQuantities[variantId])
        quantity <= updateCartQuantity.data.data.productSizeQuantities[variantId].quantity && alterQuantity(variantId, quantity )
    } catch (error) {
      //show error
    }
  }

  const handleOnDelete = (variantId: number) => (variantId in cartItems) && removeCartProduct(variantId)
  const handleCheckoutRedirect = () => router.push("/checkout")

  return (
    <>  
    {/* Background blur overlay */}
    <div 
      className="fixed inset-0 z-40 backdrop-blur-sm bg-white/10 overflow-hidden"
      style={{ touchAction: 'none' }}
    />
    
    {/* Modal container - REMOVE translate-y-full from here */}
    <section className="fixed flex flex-col w-screen justify-end items-center z-40 h-full">
      {/* Apply animation only to the article content */}
      <article className="text-neutral-800 bg-white/20 backdrop-blur-3xl overscroll-none shadow-sm shadow-neutral-500 flex flex-col h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] rounded-t-md translate-y-full animate-[slideUp_0.1s_ease-out_forwards]">
        {
          Object.keys(cartItems).length == 0 ?
            <div className="flex flex-col p-3 justify-center w-full h-full">
              <div className="flex flex-col justify-center items-center space-y-3 w-full">
                <div className="font-bold text-xs">YOUR CART IS EMPTY</div>
                <GeneralButton 
                  className="flex bg-neutral-800 items-center justify-center rounded-md p-5 text-white text-xs font-normal" 
                  display='CONTINUE SHOPPING'
                  onClick={() => setAppbarUtil("")} 
                />
              </div> 
            </div>
            :
            <div className="overflow-auto flex flex-1 flex-col rounded-t-xl p-3 pb-2 divide-black divide-y divide-dotted">
            {/* the product part of cart page  */}
            <div className="overflow-y-auto overscroll-none break-all flex flex-col pb-2 flex-1 space-y-3 h-auto scrollbar-hide">
              {/* Individual item card - row */}
              {
                // cartItems map iteration
                Object.keys(cartItems).map( (variantId, index) => {
                  if(index==0) cartTotal.current = 0;
                  if( process.env.CART_EXPIRATION_TIME && (cartItems[+variantId].expireTime! + (+process.env.CART_EXPIRATION_TIME) < Date.now()) ){
                    removeCartProduct(+variantId);
                    return <></>
                  }
                  cartTotal.current += (cartItems[+variantId].price * cartItems[+variantId].quantity)
                  return (
                  <div key={index} className="flex flex-row space-x-2 rounded-md ">
                    <Image 
                      src={String(cartItems[+variantId].productImage)} 
                      alt="image" 
                      width={90} 
                      height={30}
                      className="rounded-sm cursor-pointer hover:shadow-sm hover:shadow-black"
                      onClick={() => router.push(`/products/${cartItems[+variantId].productSku.toLowerCase()}`)}
                    ></Image>
                    {/* details part - column */}
                    <div className="flex text-xs text-neutral-800 flex-col flex-1 space-y-1">
                      <div className="font-normal ">{cartItems[+variantId].productName.toUpperCase()}</div>
                      <div className="font-normal text-neutral-800">{convertStringToINR(cartItems[+variantId].price)}</div>
                      <div className="font-normal text-neutral-800">Size: {cartItems[+variantId].size}</div>
                      <div className="flex flex-1 flex-row justify-between text-xs pr-3">
                        <QuantitySelectButton 
                          className="p-1 bg-white/10 text-neutral-600 rounded-sm font-bold" 
                          selectedQuantity = {useCartItemStore.getState().cartItems[+variantId].quantity} 
                          minQuantity={+process.env.MIN_QUANTITY_TO_ORDER!} 
                          maxQuantity={+process.env.MAX_QUANTITY_TO_ORDER!} 
                          updatingQuantity= {updateCartQuantity.isLoading}
                          onQuantityChange={handleOnQuantityChange} 
                          variantId={+variantId}
                        />
                        <div className="flex items-center cursor-pointer" onClick={()=> handleOnDelete(+variantId)}>
                          <DeleteOutlineIcon className="text-neutral-800 text-sm"/>
                        </div>
                      </div>
                    </div>
                  </div>
                )})
              }
            </div>
            {/* the total part of cart page */}
            <div className="font-normal text-xs flex flex-row justify-between pt-2 space-x-1">
              <div className="flex flex-col basis-1/2">
                <span className="text-xs text-black/50">TOTAL:</span>
                <div className="text-base text-neutral-800 font-bold"> {convertStringToINR(cartTotal.current)} </div> 
              </div>
              <div className="basis-1/2">
                <GeneralButton className=" h-full w-full font-normal" display="CHECKOUT" onClick={ handleCheckoutRedirect }/>
              </div>
            </div>
          </div>
          }
        </article>
      </section>
    </>
  );
};