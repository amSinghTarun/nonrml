"use client"

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, MotionValue } from "framer-motion";

let INR = new Intl.NumberFormat();

interface ProductCardProps {
    image: string, 
    imageAlt: string
    price: number,
    name: string,
    count: number,
    sku: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
    image,
    price,
    name,
    sku,
    imageAlt,
    count
}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`;
    const href = `/products/${sku.toLowerCase()}`;
    
    return (
        <Link 
            href={href} 
            className="group px-0.5 flex flex-col basis-1/2 md:basis-1/3 xl:basis-1/4 text-black mb-3 cursor-pointer hover:shadow-sm"
        >
            <div className="aspect-[3/4] w-full relative overflow-hidden">
                <Image
                    src={image}
                    alt={imageAlt}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    quality={100}
                    fill={true}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority={true}
                />
                {count === 0 && (
                    <div className="absolute right-2 bottom-2 text-[8px] font-normal bg-white p-1 px-2 z-10">
                        SOLD OUT
                    </div>
                )}
            </div>
            <div className="items-center flex flex-col pt-1 pb-2 w-full">
                <h1 className=" text-neutral-900 font-medium text-xs">{name.toUpperCase()}</h1>
                <p className="font-normal text-neutral-600 text-xs">{priceInCurrency}</p>
            </div>
        </Link>
    );
};
 
export const ProductCardHome : React.FC<ProductCardProps> = ({image, price, name, imageAlt, sku, count}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`
    const href = `/products/${sku.toLowerCase()}`;

    return (
        <Link href={href} className="relative flex px-1 flex-col basis-1/2 md:basis-1/4 text-black mb-2 cursor-pointer">
            {/* <div className="flex flex-col rounded-sm"> */}
                    <Image 
                        src={image} 
                        alt={imageAlt} 
                        className={`object-cover rounded-md transition-transform duration-300 group-hover:scale-110 w-auto h-[100%]`} 
                        width={2000}
                        height={1000}
                    />
                    {/* {
                        count == 0 ? <></> : 
                        <div className="absolute left-2 bottom-2 text-[10px] font-medium bg-white rounded-full p-1 pl-2 pr-2">SOLD OUT</div>
                    } */}
            {/* </div> */}
            <div className="text-black absolute right-1 bottom-0 items-center flex flex-col text-xs bg-white/70 backdrop-blur-lg py-2 px-3 rounded-tl-md rounded-br-md">
                <h1 className="font-medium">{name.toUpperCase()}</h1>
            </div>
        </Link>
    );
};

export const ProductCardParallax = ({ product, translate } : {
    product: {
        title: string;
        link: string;
        thumbnail: string;
    };
    translate?: MotionValue<number>;
}) => {
    return (
    <motion.div
        style={ translate ? { x: translate } : undefined } 
        className="h-[290px] sm:h-96 w-52 sm:w-96 relative flex-shrink-0"
        key={product.title}
    >
        <Link
            href={product.link}
            className=" relative block group-hover/product:shadow-2xl sm:mr-3 ml-3 hover:shadow-black/15 hover:shadow-md hover:bg-white/15 rounded-lg"
        >
            <Image
                src={product.thumbnail}
                height="200"
                width="600"
                className="object-cover h-full sm:h-[350px] w-full object-left-top inset-0 rounded-lg"
                alt={product.title}
            />
            <h2 className=" absolute bottom-0 right-0 text-black bg-white/50 px-4 py-3 backdrop-blur-2xl text-xs font-medium text-center rounded-tl-lg rounded-br-lg">
                {product.title.toUpperCase()}
            </h2>
        </Link>
    </motion.div>
    );
};