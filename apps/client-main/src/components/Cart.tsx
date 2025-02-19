"use client"

import React, { useState } from "react";
import { GeneralButton, QuantitySelectButton } from "./ui/buttons";
import Image from "next/image";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRef } from "react";
import { useSetAppbarUtilStore, useCartItemStore } from "@/store/atoms";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { checkProductVariantQuantityAvl } from "@/app/actions/product.action";

const convertStringToINR = (currencyString: number) => {
  let INR = new Intl.NumberFormat();
  return `INR ${INR.format(currencyString)}.00`;
}

export const CartMenu = () => {
  const cartItems = useStore(useCartItemStore, (state) => state.cartItems);
  const alterQuantity = useStore(useCartItemStore, (state) => state.alterQuantity);
  const removeCartProduct = useStore(useCartItemStore, (state) => state.removeProduct);
  const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
  const [ updateingQuantity, setUpdateQuantity ] = useState<number>(-1);
  const router = useRouter();
  let cartTotal = useRef(0);
  
  if(appbarUtil != "CART") return (<></>);
  
  const handleOnQuantityChange = (quantity: number, variantId:number) => {
    console.log(quantity, variantId)
    setUpdateQuantity(variantId);
    checkProductVariantQuantityAvl(cartItems[variantId].productId, variantId, quantity)
    .then( avl => {
      avl && (variantId in cartItems) && (setUpdateQuantity(-1), alterQuantity(variantId, quantity));
    })
    .catch( error => {

      console.log("EH! LOOK AWAY");

    })
  }
  const handleOnDelete = (variantId: number) => (variantId in cartItems) && removeCartProduct(variantId)
  const handleCheckoutRedirect = () => router.push("/checkout")

  return (
    <>
    <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none "></div>
    <section className="fixed flex flex-col w-screen justify-end items-center z-40 h-full">
      <article className="backdrop-blur-3xl shadow-sm shadow-black flex flex-col h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] rounded-tr-xl rounded-tl-xl">
      {
        Object.keys(cartItems).length == 0 ?
          <div className="flex flex-col p-3 overflow-x-scroll justify-center w-full h-full">
            <div className="flex flex-col justify-center items-center space-y-5 w-full">
              <div className="font-medium animate-bounce text-sm ">YOUR CART IS EMPTY</div>
              <GeneralButton 
                className="flex animate-bounce hover:bg-white hover:text-black hover:shadow-sm hover:shadow-black bg-black items-center justify-center rounded-xl p-10 text-white text-sm font-medium" 
                display="CONTINUE SHOPPING" 
                onClick={() => setAppbarUtil("")} 
              />
            </div> 
          </div>
          :
          <div className=" overflow-x-scroll flex flex-1 flex-col rounded-t-xl p-3 pb-4 divide-black divide-y divide-dotted">
          {/* the product part ofcart page  */}
          <div className="overflow-x-scroll break-all flex flex-col pb-2 flex-1 space-y-3">
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
                <div key={index} className="flex flex-row space-x-2 p-2 rounded-xl bg-white/5">
                  <Image 
                    src={String(cartItems[+variantId].productImage)} 
                    alt="image" 
                    width={80} 
                    height={20}
                    className="rounded-xl cursor-pointer hover:shadow-sm hover:shadow-black"
                    onClick={() => router.push(`/products/${cartItems[+variantId].productSku.toLowerCase()}`)}
                  ></Image>
                  {/* details part - column */}
                  <div className="flex flex-col flex-1 space-y-1">
                    <div className="font-medium text-sm">{cartItems[+variantId].productName.toUpperCase()}</div>
                      <div className="text-xs font-medium">SIZE: {cartItems[+variantId].size}</div>
                      <div className="text-sm font-medium">{convertStringToINR(cartItems[+variantId].price)}</div>
                    <div className="flex flex-1 flex-row justify-between text-xs pr-3">
                      <QuantitySelectButton 
                        className="p-1 bg-white/10 text-black" 
                        selectedQuantity = {useCartItemStore.getState().cartItems[+variantId].quantity} 
                        minQuantity={+process.env.MIN_QUANTITY_TO_ORDER!} 
                        maxQuantity={+process.env.MAX_QUANTITY_TO_ORDER!} 
                        updatingQuantity= {updateingQuantity == Number(variantId)}
                        onQuantityChange={handleOnQuantityChange} 
                        variantId={+variantId}
                      />
                      <div className="flex items-center cursor-pointer" onClick={()=> handleOnDelete(+variantId)}>
                        <DeleteOutlineIcon className="text-stone-800 text-sm"/>
                      </div>
                    </div>
                  </div>
                </div>
              )})
            }
          </div>
          {/* the total part of cart page */}
          <div className="font-medium text-sm flex flex-row justify-between px-2 pt-4 space-x-1">
            <div className="flex flex-col basis-1/2">
              <span className="text-xs">TOTAL:</span>
              <div className="text-xl"> {convertStringToINR(cartTotal.current)} </div> 
            </div>
            <div className="basis-1/2">
              <GeneralButton className=" h-full w-full backdrop-blur-3xl bg-black text-white hover:bg-white hover:text-black hover:shadow-sm hover:shadow-black font-medium" display="Checkout" onClick={ handleCheckoutRedirect }/>
            </div>
          </div>
        </div>
        }
      </article>
    </section>
    </>
  );
};