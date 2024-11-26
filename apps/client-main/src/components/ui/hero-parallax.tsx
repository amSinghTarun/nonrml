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

export const HeroParallax = ({
  products,
  parentRef,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
  parentRef?: React.RefObject<HTMLElement>; 
}) => {
  const firstRow = products.slice(0, 7);
  const secondRow = products.slice(5, 12);
  const thirdRow = products.slice(8, 15);
  const fourthRow = secondRow; 
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    container: parentRef,
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
    useTransform(scrollYProgress, [0, 0.2], [0.5, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-500, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-[215vh] bg-white md:h-[290vh] w-full text-white py-1 overscroll-auto overflow-y-scroll overflow-x-hidden antialiased relative flex flex-col self-auto [perspective:900px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=" sm:mt-0"
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-5 sm:space-x-10 mb-10 sm:mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-10 sm:mb-20 space-x-5 sm:space-x-10 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-5 sm:space-x-10 mb-10 sm:mb-20">
          {thirdRow.map((product) => (
            <ProductCard
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
    <div className="max-w-7xl relative mx-auto py-10 md:py-40 px-4 w-full  left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold text-black">
        The Ultimate <br /> development studio
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-black">
        We build beautiful products with the latest technologies and frameworks.
        We are a team of passionate developers and designers that love to build
        amazing products.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-60 sm:h-96 w-48 sm:w-[30rem] relative flex-shrink-0"
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
      {/* <div className="relative rounded-xl inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 shadow-productPage shadow-black pointer-events-none"></div> */}
      <h2 className="mt-4 bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};
