"use client"

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { motion, MotionValue } from "framer-motion";

let INR = new Intl.NumberFormat();

interface ProductCardProps {
    image: string;
    imageAlt: string;
    hoverImage?: string;
    price: number;
    name: string;
    count: number;
    sku: string;
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
            className="group px-0.5 flex flex-col basis-1/2 md:basis-1/3 xl:basis-1/4  mb-3 cursor-pointer"
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
                <h1 className=" text-neutral-900 font-bold text-xs">{name.toUpperCase()}</h1>
                <p className="font-normal text-neutral-600 text-xs">{priceInCurrency}</p>
            </div>
        </Link>
    );
};
 
export const ProductCardHome: React.FC<ProductCardProps> = ({
    image,
    hoverImage,
    price,
    name,
    imageAlt,
    sku,
    count
  }) => {
    const [isHovering, setIsHovering] = useState(false);
    const href = `/products/${sku.toLowerCase()}`;
    console.log(isHovering, image, hoverImage)
    return (
      <Link 
        href={href} 
        className="relative flex px-1 flex-col basis-1/2 md:basis-1/4 text-black mb-2 cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative w-full h-full">
          {/* Original image */}
          <Image 
            src={image} 
            alt={imageAlt} 
            className={`object-cover rounded-md w-auto h-[100%] transition-opacity duration-300 ${isHovering && hoverImage ? 'opacity-0' : 'opacity-100'}`} 
            width={2000}
            height={1000}
          />
          
          {/* Hover image - preloaded but hidden until hover */}
          {hoverImage && (
            <Image 
              src={hoverImage} 
              alt={`${imageAlt} alternate view`} 
              className={`object-cover rounded-md w-auto h-[100%] transition-opacity duration-300 absolute top-0 left-0 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              width={2000}
              height={1000}
              priority
            />
          )}
        </div>
        <div className="text-black absolute right-1 bottom-0 items-center flex flex-col text-[10px] sm:text-xs bg-white/40 backdrop-blur-lg py-2 rounded-tl-md rounded-br-md">
          <h1 className="font-bold">{name.toUpperCase()}</h1>
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
            <h2 className=" absolute bottom-0 right-0 text-black bg-white/50 px-4 py-3 backdrop-blur-2xl text-xs font-bold text-center rounded-tl-lg rounded-br-lg">
                {product.title.toUpperCase()}
            </h2>
        </Link>
    </motion.div>
    );
};