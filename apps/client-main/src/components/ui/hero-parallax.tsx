"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductCardParallax } from "@/components/cards/ProductCard"

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 7);
  const secondRow = products.slice(0, 7);
  const thirdRow = products.slice(0, 7);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-500, 250]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-[970px] sm:h-[1310px] backdrop-blur-lg bg-white/30 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse mb-4 sm:mb-9 overflow-x-scroll overflow-y-hidden">
          {firstRow.map((product) => (
            <ProductCardParallax
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-4 sm:mb-9 overflow-x-scroll">
          {secondRow.map((product) => (
            <ProductCardParallax
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse sm:mb-9 overflow-x-scroll">
          {thirdRow.map((product) => (
            <ProductCardParallax
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-[100%] relative mx-auto py-3 pl-3 w-full left-0 top-0">
      <h1 className="text-md font-bold">
        LATEST DROP
      </h1>
    </div>
  );
}