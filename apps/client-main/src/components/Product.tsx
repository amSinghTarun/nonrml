"use client"

import Image from "next/image";
import React from 'react';
import { Button3D, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { useState, useRef } from "react";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast"
import { useRecoilState } from "recoil";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import { cartItems as cartItemsAtom, buyNowItems as buyNowItemsAtom } from "@/store/atoms";
// import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel"
import { useRouter } from "next/navigation";

type ProductsTRPCFncOutput = RouterOutput["viewer"]["product"]["getProduct"]["data"]
interface ProductProps extends ProductsTRPCFncOutput { }

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

// if we use only 1 generic type T instead of multiple generic types like <T,U>, so that must be declared like 
// <T,>, with a ",". coz other then that it becomes difficult for typescript to differentiate between JSX tag and generic type
// const Product = <T,U>({product, productInventory, categorySizeChart}: fasdas) => {
    const Product: React.FC<ProductProps> = ({ product, productInventory, categorySizeChart }) => {
        const { toast } = useToast()
        const [buyNow, setBuyNow] = useState(false);
        const [selectedQuantity, setSelectedQuantity] = useState(1);
        const [selectedSize, setSelectedSize] = useState<{ [variantId: number]: { size: string, productId: number, quantity: number, productImage: string, productName: string, price: number } }>({});
        const [infoSectionfocus, setInfoSectionFocus] = useState<"Description" | "Details" | "Care">("Description");
        // const [cartItems, setCartItems] = useRecoilState(cartItemsAtom);
        // const [buyNowItems, setBuyNowItems] = useRecoilState(buyNowItemsAtom);
        const { setBuyNowItems } = useBuyNowItemsStore();
        const { cartItems, setCartItems } = useCartItemStore.getState();
        // const [selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom)
        const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
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
    }
    return (
        <article className="mt-3 pl-3 pr-1 flex flex-col md:flex-row flex-1 space-y-3 mr-2">
            <div className="flex rounded-xl ">
                <div className="relative">
                    <Carousel opts={{
                        align: "center",
                        loop: true
                    }}>
                        <CarouselContent className="rounded-xl">{
                            product.productImages.map((image, key) => (
                                <CarouselItem >
                                    <Image
                                        key={key}
                                        src={image.image}
                                        alt="product.name"
                                        width={0} height={0}
                                        sizes="100vw"
                                        className={`w-[100%] h-[440px] md:h-[450px] object-cover rounded-xl `}
                                    />
                                </CarouselItem>
                            ))
                        }</CarouselContent>
                    </Carousel>
                    {
                        buyNow && <div className="absolute -right-1 -bottom-3 hover:bg-white hover:text-black hover p-3 rounded-full text-white bg-black" onClick={() => {
                            selectedSize[sizeSKU.current!].quantity > 0 ?
                                handleAddToCart() : toast({
                                    duration: 1500,
                                    title: "Please Select An Available Size"
                                })
                        }}><ShoppingCartIcon /></div>
                    }
                </div>
            </div>
            <div className="space-y-3 flex-1 flex-col">
                <div className="flex flex-col pl-1 ">
                    <span className="text-black flex flex-col text-lg font-bold">
                        {product.name.toUpperCase()}
                    </span>
                    <span className="text-black text-base font-medium flex flex-col">
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
                        <>
                            <QuantitySelectButton selectedQuantity={selectedQuantity} minQuantity={1} maxQuantity={selectedSize[sizeSKU.current!]?.quantity} onQuantityChange={setSelectedQuantity} />
                            <Button3D className3d="p-5" className="basis-1/2 h-full w-full bg-black text-white shadow-0 font-normal" translateZ="40" display="Checkout" onClick={() => {
                                setBuyNowItems({
                                    [sizeSKU.current!]: { ...selectedSize[sizeSKU.current!], quantity: selectedQuantity, variantId: sizeSKU.current! }
                                })
                                router.push(`/checkout/1`)
                            }} />
                        </>
                        :
                        <>
                            <ProductPageActionButton display="Add to cart" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    handleAddToCart() : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }} />
                            <Button3D className3d="p-5" className=" h-full w-full bg-black text-white font-normal" translateZ="40" display="Buy it now" onClick={() => {
                                selectedSize[sizeSKU.current!]?.quantity > 0 ?
                                    setBuyNow(true) : toast({
                                        duration: 1500,
                                        title: "Please Select An Available Size"
                                    })
                            }}
                            />
                        </>
                }</div>
                <div className=" flex flex-col text-black text-sm ">
                    <div className="flex font-normal bg-white bg-opacity-45 rounded-tr-xl rounded-tl-xl p-2 shadow-black/15 shadow">
                        <span
                            onClick={() => setInfoSectionFocus("Details")}
                            className={`hover:cursor-pointer basis-1/3 text-center hover:font-semibold hover:text-md ${infoSectionfocus == "Details" && "font-semibold text-md"}`}
                        >Details</span>
                        <span
                            onClick={() =>
                                setInfoSectionFocus("Description")}
                            className={`hover:cursor-pointer ${infoSectionfocus == "Description" && "font-semibold text-md"} basis-1/3 text-center hover:font-semibold hover:text-md`}
                        >Description</span>
                        <span
                            onClick={() => setInfoSectionFocus("Care")}
                            className={`hover:cursor-pointer basis-1/3 text-center hover:font-semibold hover:text-md ${infoSectionfocus == "Care" && "font-semibold text-md"}`}
                        >Care</span>
                    </div>
                    <div
                        className="bg-white bg-opacity-50 text-black rounded-bl-xl mt-[0.5px] rounded-br-xl p-2 pl-5 text-xs shadow-black/15 shadow"
                    >
                        {
                            infoSectionfocus == "Details" ?
                                <ul className="flex flex-col"> {product.details.map(detail => <li>- {detail}</li>)} </ul>
                                :
                                <></>
                        }
                        {
                            infoSectionfocus == "Description" ?
                                <div className="flex"> {product.description} </div>
                                :
                                <></>
                        }
                        {
                            infoSectionfocus == "Care" ?
                                <ul className="flex flex-col"> {product.care.map(careIns => <li>- {careIns}</li>)} </ul>
                                :
                                <></>
                        }
                    </div>
                </div>
            </div>
        </article>
    )
};
export default Product;