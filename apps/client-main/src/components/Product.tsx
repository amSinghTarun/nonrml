"use client"

import Image from "next/image";
import React from 'react';
import { GeneralButton, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { useState, useRef } from "react";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/app/lib/breakpoint";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

type ProductProps = RouterOutput["viewer"]["product"]["getProduct"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

// if we use only 1 generic type T instead of multiple generic types like <T,U>, so that must be declared like 
// <T,>, with a ",". coz other then that it becomes difficult for typescript to differentiate between JSX tag and generic type
// const Product = <T,U>({product, productSizeQuantities, categorySizeChart}: fasdas) => {
const Product: React.FC<ProductProps> = ({ product, productSizeQuantities, categorySizeChart }) => {
    const { toast } = useToast();
    const [buyNow, setBuyNow] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<{ [variantId: number]: { size: string, productId: number, productSku: string, quantity: number, productImage: string, productName: string, price: number } }>({});
    const { setBuyNowItems } = useBuyNowItemsStore();
    const { cartItems, setCartItems } = useCartItemStore.getState();
    const { setAppbarUtil } = useSetAppbarUtilStore();
    const isScreenLg = useBreakpoint('1024px');
    const router = useRouter();
    const sizeSKU = useRef<number>();
    const handleAddToCart = () => {
        let variantId: number = sizeSKU.current!;
        if ( variantId && productSizeQuantities[variantId] ) {
            let itemQuantity = cartItems[variantId] ? ++cartItems[variantId].quantity : 1 ;
            if(itemQuantity > productSizeQuantities[variantId].quantity){
                toast({duration: 1500, title: "Can't add more for this size"})
            } else {
                const cartItem = { [variantId]: { ...selectedSize[variantId], quantity: itemQuantity, variantId: variantId } }
                setCartItems(cartItem);
                setAppbarUtil("CART");
            }
        }
    };
    
    return (
        <article className="my-3 pl-3 pr-1 flex flex-col lg:flex-row flex-1 space-y-2 lg:space-x-3 lg:space-y-0 mr-2">
            <div className=" lg:basis-2/4 relative max-h-[500px] rounded-xl w-auto overscroll-auto">
                <Carousel 
                    plugins={[
                        WheelGesturesPlugin("is-wheel-dragging")
                    ]}
                    opts= {isScreenLg ? { dragFree: true, align: "start", loop:true } : { dragFree: true, align: "center", loop: true } }
                    orientation= {isScreenLg ? "vertical" : "horizontal"}
                >
                    <CarouselContent className="rounded-xl w-md lg:h-screen">{
                        product.productImages.sort((a, b) => a.priorityIndex - b.priorityIndex).map((image, key) => (
                            <CarouselItem key={key} className="w-full sm:max-w-[70%] lg:max-w-full rounded-xl lg:max-h-[750px] 2xl:max-h-[750px]">
                                <Image
                                    src={image.image}
                                    alt={product.name}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className= { `w-[100%] h-[500px] md:h-[500px] lg:h-full object-cover` }
                                />
                            </CarouselItem>
                        ))
                    }</CarouselContent>
                </Carousel>
                {
                    (!isScreenLg && buyNow) && 
                        <div 
                            className=" absolute -right-1 -bottom-3 hover:bg-white hover:text-black/90 cursor-pointer p-3 rounded-full text-white bg-neutral-800" 
                            onClick={() => {
                                selectedSize[sizeSKU.current!].quantity > 0 ?
                                    handleAddToCart() :
                                    toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size",
                                        
                                    })
                            }}
                        ><ShoppingCartIcon /></div>
                }
            </div>
            <div className=" lg:basis-2/4 space-y-3 flex flex-col lg:h-screen lg:justify-center py-2">
                <div className="flex flex-col pl-1 ">
                    <span  className="text-neutral-800 flex flex-col text-md lg:text-xl font-medium">
                        {product.name.toUpperCase()}
                    </span>
                    <span  className="text-neutral-700 text-sm lg:text-md font-normal flex flex-col">
                        {convertStringToINR(Number(product.price))}
                    </span>
                </div>
                <div className="flex flex-row text-xs gap-2">{
                    Object.values(productSizeQuantities).map(({ size, variantId, quantity }, index) => {
                        return(
                            <SizeButton sizeCount={Object.keys(productSizeQuantities).length} sku={product.sku} productId={product.id} display={size} price={+product.price} quantity={quantity} variantId={variantId} name={product.name} image={product.productImages[0].image} selectedSize={sizeSKU} setSelectedSize={setSelectedSize} setQuantity={setSelectedQuantity} key={index}></SizeButton>
                        )
                    })
                }</div>
                <div className="flex flex-row text-xs w-full gap-2">{
                    buyNow ?
                        <div className="flex flex-col w-full space-y-2">
                            {
                                isScreenLg ? 
                                <ProductPageActionButton display="ADD TO CART" onClick={() => {
                                    selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                        handleAddToCart() : toast({
                                            duration: 1500,
                                            title: "Please Select An Available Size"
                                        })
                                }} /> : <></>
                            }
                            <div className="flex flex-row w-full space-x-2">
                                <QuantitySelectButton selectedQuantity={selectedQuantity} minQuantity={1} maxQuantity={selectedSize[sizeSKU.current!]?.quantity} onQuantityChange={setSelectedQuantity} />
                                <GeneralButton className=" h-full w-full backdrop-blur-3xl bg-neutral-800 text-white font-medium" display="CHECKOUT" onClick={() => {
                                    setBuyNowItems({
                                        [sizeSKU.current!]: { ...selectedSize[sizeSKU.current!], quantity: selectedQuantity, variantId: sizeSKU.current! }
                                    })
                                    router.push(`/checkout?purchase=1`)
                                }} />
                            </div>
                        </div>
                        :
                        <>
                            <ProductPageActionButton display="ADD TO CART" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    handleAddToCart() : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }} />
                            <GeneralButton className=" h-full w-full p-3 bg-neutral-800 text-white font-medium"  display="BUT IT NOW" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    setBuyNow(true) : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }}
                            />
                        </>
                }</div>
                <div className="flex-col text-neutral-800 flex text-xs bg-white bg-opacity-45 rounded-md divide-y divide-black/25 space-y-2 px-3 py-2 shadow-black/15 shadow">

                    <div className="flex lg:flex-col lg:space-y-1 lg:content-center lg:text-center">
                        <span  className="font-medium text-start basis-1/3">
                            DESCRIPTION
                        </span>
                        <div className="basis-2/3 text-neutral-600 lg:pl-2"> {product.description} </div>
                    </div>

                    <div className="flex pt-2 lg:flex-col lg:space-y-1">
                        <span  className="font-medium text-start basis-1/3 ">
                            DETAILS
                        </span>
                        <ul className="basis-2/3 lg:pl-2"> { product.details.map((detail, index) => <li key={index} >{detail}</li>)} </ul>
                    </div>
                        
                        
                    <div className="flex pt-2 lg:flex-col lg:space-y-1">
                        <span  className="font-medium basis-1/3 text-start">
                            CARE
                        </span>
                        <ul className="basis-2/3 lg:pl-2"> { product.care.map((careIns, index) => <li key={index} > {careIns}</li>)} </ul>
                    </div>

                    <div className="flex pt-2 lg:flex-col lg:space-y-1">
                        <span  className="font-medium text-start basis-1/3">
                            SHIPPING
                        </span>
                        <ul className="basis-2/3 lg:pl-2"> { product.care.map((careIns, index) => <li key={index} > {careIns}</li>)} </ul>
                    </div>
                    
                </div>
            </div>
        </article>
    )
};
export default Product;