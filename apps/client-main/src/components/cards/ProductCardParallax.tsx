"use client"

import { motion, MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const ProductCardParallax = ({ product, translate } : {
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
        whileHover={{
          y: -20,
        }}
        key={product.title}
        className="group/product h-[300px] sm:h-96 w-48 sm:w-[30rem] relative flex-shrink-0"
      >
        <Link
          href={product.link}
          className="block group-hover/product:shadow-2xl "
        >
          <Image
            src={product.thumbnail}
            height="600"
            width="600"
            className="object-cover object-left-top absolute h-full w-full inset-0 rounded-xl"
            alt={product.title}
          />
        </Link>
        {/* <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div> */}
        <h2 className="absolute bottom-2 left-0 text-white bg-black p-1 pr-2 text-sm rounded-r-lg">
          {product.title.toUpperCase()}
        </h2>
      </motion.div>
    );
  };
  
  export default ProductCardParallax