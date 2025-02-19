"use client"

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, MotionValue } from "framer-motion";
import { GlowingEffect } from "../ui/glowing-effect";

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
            className="px-0.5 flex flex-col basis-1/2 lg:basis-1/3 xl:basis-1/4 text-black mb-3 cursor-pointer hover:shadow-sm h-full"
        >
            <div className="flex flex-col relative flex-grow">
                <div className="w-full h-[300px] md:h-[380px] lg:h-[420px] xl:h-[450px] relative overflow-hidden">
                    <div className="w-full h-full transform transition-transform duration-300 hover:scale-110">
                        <Image
                            src={image}
                            alt={imageAlt}
                            className="object-cover"
                            quality={100}
                            fill={true}
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            style={{
                                width: '100%',
                            }}
                            width={0}
                            height={0}
                        />
                    </div>
                    {count !== 0 ? (
                        <></>
                    ) : (
                        <div className="absolute right-2 bottom-2 text-[8px] font-normal bg-white p-1 pl-2 pr-2 z-10">
                            SOLD OUT
                        </div>
                    )}
                </div>
            </div>
            <div className="text-black items-center flex flex-col pt-1 pb-2 w-full">
                <h1 className="font-medium text-xs">{name.toUpperCase()}</h1>
                <p className="font-normal text-gray-700 text-xs">{priceInCurrency}</p>
            </div>
        </Link>
    );
};

export const ProductCardHome : React.FC<ProductCardProps> = ({image, price, name, imageAlt, sku, count}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`
    const href = `/products/${sku.toLowerCase()}`;

    return (
        <Link href={href} className="relative hover:bg-red-50 hover:rounded-xl flex px-1 flex-col basis-1/2 lg:basis-1/4 text-black mb-2 cursor-pointer">
            {/* <div className="flex flex-col rounded-sm"> */}
                    <Image 
                        src={image} 
                        alt={imageAlt} 
                        className={`object-cover rounded-lg w-auto h-[265px] md:h-[100%] lg:h-max`} 
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