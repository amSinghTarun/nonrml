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

export const ProductCard : React.FC<ProductCardProps> = ({image, price, name, sku, imageAlt, count}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`
    const href = `/products/${sku.toLowerCase()}`;

    return (
        <Link href={href} className=" px-1 flex flex-col basis-1/2 md:basis-1/3 xl:basis-1/4 text-black mb-3 hover:cursor-pointer space-y-0.5">
            <div className="flex flex-col relative rounded-t-sm">
                    <Image 
                        src={image} 
                        alt={imageAlt} 
                        className={`object-cover rounded-t-xl w-auto h-[350px] md:h-[100%]`} 
                        width={1000} 
                        height={1000}
                        // style={{ width: '100%', height: '380px'}} 
                    />
                    {
                        count != 0 ? <></> : 
                        <div className="absolute left-2 bottom-2 text-[10px] font-medium bg-white rounded-full p-1 pl-2 pr-2">SOLD OUT</div>
                    }
            </div>
            <div className="text-black rounded-b-lg items-center flex flex-col text-sm backdrop-blur-3xl py-2 ">
                <h1 className="font-medium">{name.toUpperCase()}</h1>
                <p className="font-normal">{priceInCurrency}</p>
            </div>
        </Link>
    );
};

export const ProductCardHome : React.FC<ProductCardProps> = ({image, price, name, imageAlt, sku, count}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`
    const href = `/products/${sku.toLowerCase()}`;

    return (
        <Link href={href} className=" hover:bg-black/15 hover:rounded-xl flex px-1 pt-1 flex-col basis-1/2 lg:basis-1/4 text-black mb-3 hover:cursor-pointer space-y-0.5">
            <div className="flex flex-col relative rounded-t-md">
                    <Image 
                        src={image} 
                        alt={imageAlt} 
                        className={`object-cover rounded-t-xl w-auto h-[250px] md:h-[100%]`} 
                        width={1000} 
                        height={1000}
                        // style={{ width: '100%', height: '380px'}} 
                    />
                    {
                        count != 0 ? <></> : 
                        <div className="absolute left-2 bottom-2 text-[10px] font-medium bg-white rounded-full p-1 pl-2 pr-2">SOLD OUT</div>
                    }
            </div>
            <div className="text-black items-center flex flex-col text-xs py-1 pb-2 rounded-b-md">
                <h1 className="font-medium">{name.toUpperCase()}</h1>
                <p className="font-normal">{priceInCurrency}</p>
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
            className="block group-hover/product:shadow-2xl sm:mr-3 ml-3 hover:shadow-black hover:shadow-md hover:bg-white rounded-lg"
        >
            <Image
                src={product.thumbnail}
                height="200"
                width="600"
                className="object-cover h-full sm:h-[340px] w-full object-left-top inset-0 rounded-t-lg"
                alt={product.title}
            />
            <h2 className=" text-black bg-white/5 p-1 backdrop-blur-2xl text-xs font-medium text-center py-3 rounded-b-lg ">
                {product.title.toUpperCase()}
            </h2>
        </Link>
    </motion.div>
    );
};