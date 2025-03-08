"use client"

import Image from "next/image";
import React from 'react';
import { GeneralButton, GeneralButtonTransparent, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { useState, useRef } from "react";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/app/lib/breakpoint";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import {SizeChart} from "./SizeChart";

type ProductProps = RouterOutput["viewer"]["product"]["getProduct"]["data"];

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

const Product: React.FC<ProductProps> = ({ product, productSizeQuantities }) => {
    const { toast } = useToast();
    const [buyNow, setBuyNow] = useState(false);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [selectedSize, setSelectedSize] = useState<{ [variantId: number]: { size: string, productId: number, productSku: string, quantity: number, productImage: string, productName: string, price: number } }>({});
    const { setBuyNowItems } = useBuyNowItemsStore();
    const { cartItems, setCartItems } = useCartItemStore.getState();
    const { setAppbarUtil } = useSetAppbarUtilStore();
    const isScreenLg = useBreakpoint('1024px');
    const router = useRouter();
    const sizeSKU = useRef<number>();

    const handleAddToCart = () => {
        let variantId: number = sizeSKU.current!;
        if (variantId && productSizeQuantities[variantId]) {
            let itemQuantity = cartItems[variantId] ? ++cartItems[variantId].quantity : 1;
            if (itemQuantity > productSizeQuantities[variantId].quantity) {
                toast({ duration: 1500, title: "Can't add more for this size" })
            } else {
                const cartItem = { [variantId]: { ...selectedSize[variantId], quantity: itemQuantity, variantId: variantId } }
                setCartItems(cartItem);
                setAppbarUtil("CART");
            }
        }
    };

    return (
        <article className="my-3 px-1 flex flex-col lg:flex-row flex-1 space-y-2 lg:space-x-3 lg:space-y-0">
            <div className="lg:basis-1/2 2xl:basis-5/12 relative lg:min-h-screen">
                <Carousel
                    plugins={[
                        WheelGesturesPlugin("is-wheel-dragging")
                    ]}
                    opts={isScreenLg ? { dragFree: true, align: "start", loop: true } : { dragFree: true, align: "center", loop: true }}
                    orientation={isScreenLg ? "vertical" : "horizontal"}
                    className="lg:h-screen w-full"
                >
                    <CarouselContent className="w-full lg:h-screen">{
                        product.productImages.sort((a, b) => a.priorityIndex - b.priorityIndex).map((image, key) => (
                            // the below basis-1/2 is important to tell the carousel to keep more thn 1 item in the view point otherwise,
                            // it keeps only one image in whole content length
                            <CarouselItem key={key} className="w-full lg:basis-1/2"> 
                                <Image
                                    src={image.image}
                                    alt={product.name}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-[550px] lg:h-auto object-cover"
                                />
                            </CarouselItem>
                        ))
                    }</CarouselContent>
                </Carousel>
                {
                    (!isScreenLg && buyNow) &&
                    <div
                        className="absolute left-0 bottom-0 hover:bg-white cursor-pointer p-3 rounded-tr-md text-black bg-white/45 backdrop-blur-3xl"
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
                <div className={`absolute right-1 bottom-1 ${isScreenLg && "top-0 right-0"}`}>
                    <GeneralButtonTransparent display="Size Chart" className={`px-2 py-1 rounded-sm text-neutral-200 bg-neutral-500 opacity-70 backdrop-blur-3xl border-none w-fit text-xs ${isModalOpen && "opacity-0"}`} onClick={openModal}/>
                </div>

            </div>
            <div className=" lg:overflow-y-auto flex flex-1 lg:pb-20 py-1 px-1 xl:justify-center">
                <div className="space-y-4 flex-col w-full 2xl:w-5/6 content-end">
                    <div className="flex flex-col pl-1 text-center space-y-2">
                        <span className="text-neutral-800 flex flex-col text-sm lg:text-lg font-medium">
                            {product.name.toUpperCase()}
                        </span>
                        <span className="text-neutral-600 text-xs lg:text-md font-normal flex flex-col">
                            {convertStringToINR(Number(product.price))}
                        </span>
                        <span className="text-neutral-500 text-xs text-center lg:text-md font-normal flex flex-col">
                            {"Repalce it with design inspiration text"}
                        </span>
                    </div>
                    <div className="flex flex-row text-xs gap-2">{
                        Object.values(productSizeQuantities).map(({ size, variantId, quantity }, index) => (
                            <SizeButton
                                key={index}
                                sizeCount={Object.keys(productSizeQuantities).length}
                                sku={product.sku}
                                productId={product.id}
                                display={size}
                                price={+product.price}
                                quantity={quantity}
                                variantId={variantId}
                                name={product.name}
                                image={product.productImages[0].image}
                                selectedSize={sizeSKU}
                                setSelectedSize={setSelectedSize}
                                setQuantity={setSelectedQuantity}
                            />
                        ))
                    }</div>
                    <div className="flex flex-row text-xs w-full gap-2">{
                        buyNow ?
                            <div className="flex flex-col w-full space-y-2">
                                { isScreenLg 
                                    && <ProductPageActionButton display="ADD TO CART" onClick={() => {
                                        selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                            handleAddToCart() : toast({
                                                duration: 1500,
                                                title: "Please Select An Available Size"
                                            })
                                    }} /> 
                                }
                                <div className="flex flex-row w-full space-x-2">
                                    <QuantitySelectButton
                                        selectedQuantity={selectedQuantity}
                                        minQuantity={1}
                                        maxQuantity={selectedSize[sizeSKU.current!]?.quantity}
                                        onQuantityChange={setSelectedQuantity}
                                    />
                                    <GeneralButton
                                        className="h-full w-full backdrop-blur-3xl bg-neutral-800 text-white font-medium"
                                        display="CHECKOUT"
                                        onClick={() => {
                                            setBuyNowItems({
                                                [sizeSKU.current!]: { ...selectedSize[sizeSKU.current!], quantity: selectedQuantity, variantId: sizeSKU.current! }
                                            })
                                            router.push(`/checkout?purchase=1`)
                                        }}
                                    />
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
                                <GeneralButton
                                    className="h-full w-full p-3 font-medium"
                                    display="BUY IT NOW"
                                    onClick={() => {
                                        selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                            setBuyNow(true) : toast({
                                                duration: 1500,
                                                title: "Please Select An Available Size"
                                            })
                                    }}
                                />
                            </>
                    }</div>
                    <div className="flex-col text-neutral-700 flex text-xs rounded-md divide-y divide-neutral-200 space-y-4 px-3 py-4 shadow-neutral-100 shadow lg:shadow-none">
                        <div className="flex lg:flex-col lg:text-center lg:space-y-1">
                            <span className="font-normal lg:font-medium basis-1/3 content-center">DESCRIPTION</span>
                            <div className="basis-2/3 font-light text-neutral-500 lg:px-2 line-">{`${product.description}`}</div>
                        </div>

                        <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
                            <span className="font-normal lg:font-medium basis-1/3 content-center">DETAILS</span>
                            <div className="basis-2/3 font-light text-neutral-500 lg:px-2 line-">{`${product.details}`}</div>
                        </div>

                        <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
                            <span className="font-normal lg:font-medium basis-1/3 content-center">CARE</span>
                            <div className="basis-2/3 font-light text-neutral-500 lg:px-2 line-">{`${product.care}`}</div>
                        </div>
                        <div className="flex pt-2 justify-center lg:flex-col lg:text-center lg:space-y-1">
                            <span className="font-normal basis-1/3 lg:font-medium content-center">SHIPPING</span>
                            <div className="basis-2/3 font-light text-neutral-500 lg:px-2 line-">{`${product.care}`}</div>
                        </div>
                    </div>
                </div>
            </div>
            <SizeChart 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                sizeChartCategoryNameId={product.sizeChartId ?? product.category.sizeChartId} 
            />
        </article>
    )
};

export default Product;