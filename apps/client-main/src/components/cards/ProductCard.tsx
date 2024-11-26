import Image from "next/image";
import { ReactElement } from "react";
import Link from "next/link";
import React from "react";

let INR = new Intl.NumberFormat();

interface ProductContainerProps {
    children:ReactElement<ProductCardProps>[];
}

export const ProductContainer : React.FC<ProductContainerProps> = ({children}) => {
    return (
        <section className="flex flex-row flex-wrap bg-transparent pl-2">
            {children}
        </section>
    )
};

interface ProductCardProps {
    image: string, 
    imageAlt: string
    price: number,
    name: string,
    id: number,
    count: number
}

export const ProductCard : React.FC<ProductCardProps> = ({image, price, name, imageAlt, id, count}) => {
    const priceInCurrency = `INR ${INR.format(price)}.00`
    const href = `/products/${name.toLowerCase().replaceAll(" ", "-")}_${id}`;

    return (
        <Link href={href} className=" pr-2 flex flex-col basis-1/2 md:basis-1/3 xl:basis-1/4 text-black mb-4 hover:cursor-pointer space-y-0.5">
            <div className="flex flex-col relative rounded-t-xl">
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
            <div className="text-black  flex flex-col pl-1.5 text-sm backdrop-blur-3xl bg-gradient-to-r from-white/30 to-transparent rounded-b-xl">
                <h1 className="font-medium">{name.toUpperCase()}</h1>
                <p className="font-normal">{priceInCurrency}</p>
            </div>
        </Link>
    );
};