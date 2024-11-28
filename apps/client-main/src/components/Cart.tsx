"use client"

import { useRecoilState } from "recoil";
// import { cartItems as cartItemsAtom } from "@/store/atoms";
import { useCartItemStore } from "@/store/atoms"
import { Button3D, QuantitySelectButton } from "./ui/buttons";
import Image from "next/image";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRef } from "react";
// import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useRouter } from "next/navigation";
import React from "react";

const convertStringToINR = (currencyString: number) => {
  let INR = new Intl.NumberFormat();
  return `INR ${INR.format(currencyString)}.00`;
}

export const CartMenu = () => {
  // const [ cartItems, setCartItems ] = useRecoilState(cartItemsAtom);
  const { cartItems, setCartItems } = useCartItemStore.getState()
  // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom)
  const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
  const router = useRouter()
  let cartTotal = useRef(0);
  
  if(appbarUtil != "CART") return (<></>);
  
  const handleOnQuantityChange = (quantity: number, variantId:number) => {
    if(variantId in cartItems){
      //console.log(quantity);
      const selectedItem = cartItems[variantId];
      setCartItems({
        [variantId]: {
          productName: selectedItem.productName,
          productId: selectedItem.productId,
          variantId: variantId,
          productImage: selectedItem.productImage,
          quantity: quantity,
          size: selectedItem.size, 
          price: selectedItem.price
        }
      })
    }
  }

  const handleOnDelete = (variantId: number) => {
    if(variantId in cartItems){
      const newCartItems = {...cartItems} //creating a shallow copy to delete the property, otherwise it throws the can'nt delete error
      delete newCartItems[variantId]
      setCartItems(newCartItems);
    }
  }


  return (
    <>
    <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none "></div>
    <section className="fixed flex flex-col w-screen justify-end items-center z-40 h-full">
      <article className="backdrop-blur-3xl shadow-sm shadow-black flex flex-col h-[60%] w-[90%] lg:w-[50%] lg:h-[70%] rounded-tr-xl rounded-tl-xl">
      {
        Object.keys(cartItems).length == 0 ?
          <div className="flex flex-col p-3 overflow-x-scroll justify-between w-full h-full pt-20">
            <div className="flex flex-col justify-center items-center space-y-5 w-full">
              <div className="font-medium text-sm ">YOUR CART IS EMPTY</div>
              <Button3D display="CONTINUE SHOPPING" className3dBody="w-auto" className="flex bg-black items-center justify-center rounded-xl p-10 text-white text-sm font-normal" translateZ="50" onClick={() => setAppbarUtil("")} />
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
                if(index==0)cartTotal.current = 0;
                cartTotal.current += (cartItems[+variantId].price * cartItems[+variantId].quantity)
                return (
                <div className="flex flex-row space-x-2 p-2 rounded-xl bg-white/5">
                  <Image 
                    src={String(cartItems[+variantId].productImage)} 
                    alt="image" 
                    width={80} 
                    height={20}
                    className="rounded-xl "
                  ></Image>
                  {/* details part - column */}
                  <div className="flex flex-col flex-1 space-y-1">
                    <div className="font-medium text-sm">{cartItems[+variantId].productName.toUpperCase()}</div>
                      <div className="text-xs font-medium">SIZE: {cartItems[+variantId].size}</div>
                      <div className="text-sm font-medium">{convertStringToINR(cartItems[+variantId].price)}</div>
                    <div className="flex flex-1 flex-row justify-between text-xs pr-3">
                      <QuantitySelectButton className="p-1 bg-white/10 text-black" selectedQuantity={cartItems[+variantId].quantity} minQuantity={1} maxQuantity={20} onQuantityChange={handleOnQuantityChange} variantId={+variantId}/>
                      <div className="flex items-center hover:cursor-pointer" onClick={()=> handleOnDelete(+variantId)}>
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
              <text className="text-xs">TOTAL:</text>
              <text className="text-xl">{convertStringToINR(cartTotal.current)}</text>
            </div>
            <div className="basis-1/2">
              <Button3D className=" h-full w-full backdrop-blur-3xl bg-black text-white shadow-0 font-normal" className3d="px-5" translateZ="40" display="Checkout" onClick={()=> router.push("/checkout/2")}/>
            </div>
          </div>
        </div>
        }
      </article>
    </section>
    </>
  );
};