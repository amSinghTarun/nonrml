"use client"

import Image from "next/image";
import React from 'react';
import { Button3D, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { useState, useRef } from "react";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/app/lib/breakpoint";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

type ProductsTRPCFncOutput = RouterOutput["viewer"]["product"]["getProduct"]["data"];

interface ProductProps extends ProductsTRPCFncOutput { }

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

// if we use only 1 generic type T instead of multiple generic types like <T,U>, so that must be declared like 
// <T,>, with a ",". coz other then that it becomes difficult for typescript to differentiate between JSX tag and generic type
// const Product = <T,U>({product, productInventory, categorySizeChart}: fasdas) => {
const Product: React.FC<ProductProps> = ({ product, productInventory, categorySizeChart }) => {
    const { toast } = useToast();
    const [buyNow, setBuyNow] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<{ [variantId: number]: { size: string, productId: number, quantity: number, productImage: string, productName: string, price: number } }>({});
    const { setBuyNowItems } = useBuyNowItemsStore();
    const { cartItems, setCartItems } = useCartItemStore.getState();
    const { setAppbarUtil } = useSetAppbarUtilStore();
    const isScreenLg = useBreakpoint('1024px');
    const router = useRouter();
    const sizeSKU = useRef<number>();
    const handleAddToCart = () => {
        let itemQuantity = 1;
        let variantId: number = sizeSKU.current!;
        if (variantId) {
            itemQuantity += (cartItems[variantId]?.quantity ?? 0);
            const cartItem = { [variantId]: { ...selectedSize[variantId], quantity: itemQuantity, variantId: variantId } }
            setCartItems(cartItem);
            setAppbarUtil("CART");
        }
    };
    
    return (
        <article className="my-3 pl-3 pr-1 flex flex-col lg:flex-row flex-1 space-y-3 lg:space-x-3 lg:space-y-0 mr-2">
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
                            <CarouselItem key={key} className="w-full sm:max-w-[70%] lg:max-w-full rounded-xl lg:max-h-[650px] 2xl:max-h-[750px]">
                                <Image
                                    src={image.image}
                                    alt={product.name}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className= { `w-[100%] h-[440px] md:h-[500px] lg:h-full object-cover rounded-xl` }
                                />
                            </CarouselItem>
                        ))
                    }</CarouselContent>
                </Carousel>
                {
                    (!isScreenLg && buyNow) && 
                        <div 
                            className=" absolute -right-1 -bottom-3 hover:bg-white hover:text-black hover p-3 rounded-full text-white bg-black" 
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
            <div className=" lg:basis-2/4 space-y-3 flex flex-col lg:h-screen lg:justify-end py-3">
                <div className="flex flex-col pl-1 ">
                    <span className="text-black flex flex-col text-lg lg:text-2xl font-bold">
                        {product.name.toUpperCase()}
                    </span>
                    <span className="text-black text-base lg:text-xl font-medium flex flex-col">
                        {convertStringToINR(Number(product.price))}
                    </span>
                </div>
                <div className="flex flex-row gap-2 text-xs">{
                    productInventory.map(({ size, id, inventory }, index) => {
                        let quantity = (!inventory?.baseSkuInventory || !inventory?.quantity) ? 0 : inventory.quantity + inventory.baseSkuInventory.quantity;
                        return(
                            <SizeButton sizeCount={productInventory.length} productId={product.id} display={size} price={+product.price} quantity={quantity} variantId={id} name={product.name} image={product.productImages[0].image} selectedSize={sizeSKU} setSelectedSize={setSelectedSize} setQuantity={setSelectedQuantity} key={index}></SizeButton>
                        )
                    })
                }</div>
                <div className="flex flex-row text-sm w-full gap-2">{
                    buyNow ?
                        <div className="flex flex-col w-full space-y-2">
                            <div className="flex flex-row w-full space-x-2">
                            
                                <QuantitySelectButton selectedQuantity={selectedQuantity} minQuantity={1} maxQuantity={selectedSize[sizeSKU.current!]?.quantity} onQuantityChange={setSelectedQuantity} />
                                <Button3D className3d="p-5" className="basis-1/2 h-full w-full bg-black text-white shadow-0 font-semibold" translateZ="40" display="Checkout" onClick={() => {
                                    setBuyNowItems({
                                        [sizeSKU.current!]: { ...selectedSize[sizeSKU.current!], quantity: selectedQuantity, variantId: sizeSKU.current! }
                                    })
                                    router.push(`/checkout/1`)
                                }} />
                            </div>
                            {
                                isScreenLg ? 
                                <ProductPageActionButton display="Add to cart" onClick={() => {
                                    selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                        handleAddToCart() : toast({
                                            duration: 1500,
                                            title: "Please Select An Available Size"
                                        })
                                }} /> : <></>
                            }
                        </div>
                        :
                        <>
                            <ProductPageActionButton display="Add to cart" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    handleAddToCart() : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }} />
                            <Button3D className3d="p-5" className=" h-full w-full bg-black text-white font-semibold" translateZ="40" display="Buy it now" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    setBuyNow(true) : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }}
                            />
                        </>
                }</div>
                <div className="flex-col flex font-normal bg-white bg-opacity-45 rounded-xl text-sm divide-y divide-black/25 space-y-2 px-3 py-2 shadow-black/15 shadow">

                    <div className="flex">
                        <span className="font-semibold text-start text-md basis-1/3">
                            Description
                        </span>
                        <div className="basis-2/3"> {product.description} </div>
                    </div>

                    <div className="flex pt-2">
                        <span className="font-semibold text-start text-md basis-1/3 ">
                            Details
                        </span>
                        <ul className="basis-2/3"> { product.details.map((detail, index) => <li key={index} >{detail}</li>)} </ul>
                    </div>
                        
                        
                    <div className="flex pt-2">
                        <span className="font-semibold text-md basis-1/3 text-start">
                            Care
                        </span>
                        <ul className="basis-2/3"> { product.care.map((careIns, index) => <li key={index} > {careIns}</li>)} </ul>
                    </div>

                    <div className="flex pt-2">
                        <span className="font-semibold text-start text-md basis-1/3">
                            Shipping
                        </span>
                        <ul className="basis-2/3"> { product.care.map((careIns, index) => <li key={index} > {careIns}</li>)} </ul>
                    </div>
                    
                </div>
            </div>
        </article>
    )
};
export default Product;