import { Vortex } from "../ui/vortex";
import { FlipWords } from "../ui/flip-words";
import React from "react";
import { HeroParallax } from "../ui/hero-parallax";
import { MaskContainer } from "../ui/svg-mask-effect";
import Image from "next/image";
import homeImage from "../../images/AMI_4024-Edit-2_1668x2500_crop_center.jpg"
import Link from "next/link";
import logo from "@/images/logo.png";
const words = ["NORMAL", "STANDARD", "USUAL", "ORDINARY", "COMMON"]; 
import { getHomepageProducts } from "@/app/actions/product.action";
import { ProductCardHome } from "@/components/cards/ProductCard";

export async function LandingPage() {
  let products = await getHomepageProducts();

  return (
    <div  className="w-screen h-full">


      <Image  className=" w-screen h-screen fixed" sizes="100vh" src={homeImage} height={100} width={100} alt="homeImage" />
      <MaskContainer
        revealText={
          <p className="max-w-4xl mx-auto bg-white/60 p-5 text-center">
            <Image
                src={logo}
                alt="No NRML logo"
                priority
                width={0} height={0}
                sizes="100vw" 
                style={{ color:"white",width: 'auto', height: "40px"}}
            ></Image>
          </p>
        }
        className=" w-full text-sm fixed "
      >
        <span className="text-red-500">nonrml</span> is more than just a brand; it's a movement that challenges the status quo. 
        Built around the power of saying "no," <span className="text-red-500">nonrml</span>  defies conventions, breaks free from standards, 
        and redefines what the world sees as normal. Throughout history, 
        the most groundbreaking achievements have come from those who dared to reject the <span className="text-red-500">nonrml</span> —
        those who refused to settle for the usual and pushed boundaries to create something extraordinary. 
        <span className="text-red-500">nonrml</span>  embodies this spirit of rebellion, inspiring a community that isn't afraid to say no to norms
         and yes to innovation, creativity, and progress. In a world full of conformity, <span className="text-red-500">nonrml</span>  stands
          out by embracing the bold, the different, and the unapologetic pursuit of greatness.
      </MaskContainer>
      <div className="h-screen overscroll-auto bg-transparent w-full ">
      </div>

      <div className="z-30 relative w-full flex flex-1 flex-col backdrop-blur-xl bg-white/10 pt-5 space-y-5 px-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-medium text-sm flex flex-grow pl-3 text-black">LATEST DROP</h1>
        </div>
        <div className="flex flex-row flex-wrap w-full h-full">
          {
            products.latestProducts.map( product => ( 
              <ProductCardHome  
                key={product.sku}
                image={product.productImages[0]?.image}
                hoverImage={product.productImages[1]?.image}
                name={product.name}
                sku={product.sku}
                count={product._count.ProductVariants}
                imageAlt={product.name}
                price={+product.price}
              />
            ))
          }
        </div>
      </div>

{/* 


      <div
        className="flex z-30 relative py-7 md:py-10 bg-white flex-col justify-center px-2 md:px-3 w-full h-full"
      >
        <h2 className="text-black bg-transparent text-sm md:text-3xl font-bold text-center">
          <span>{`ALL IT TAKES IS A `} </span>
          <span className="text-rose-500">NO</span>
          <span>{` TO REDEFINE WHAT IS`}</span>
          <FlipWords className="text-rose-500" words={words} />
        </h2>
      </div>


      <div className="w-[100%] h-[500px] sm:h-[600px] relative">
        <Image 
          src={products.exculsiveProducts.productImages[0].image} 
          alt={"imageAlt"} 
          className={`object-cover absolute w-[100%] h-[100%]`} 
          width={1000} 
          height={1000}
        />
        <Vortex 
          backgroundColor="transparent"
          className="absolute w-full flex h-full justify-center items-center content-center text-center"
        >
          <Link href={`/products/${products.exculsiveProducts.sku.toLowerCase()}`} className="rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white text-black flex flex-col px-14 py-7 space-y-5">
            <div className="items-center flex justify-center basis-1/3 text-xl sm:text-2xl font-bold" >
              <span>EXCLUSIVE DROP <span className={`text-rose-500`}>{` :)`}</span> </span>
            </div>
            <div className="justify-center text-sm font-medium items-center flex flex-col basis-2/3">
              <span >A Brand New Exclusive Product Is Live! </span>
              <span >{`Hurry Up!  BUY NOW!`}</span>
            </div>
          </Link>
        </Vortex>
      </div> */}


      <div className="z-30 relative w-full flex flex-1 flex-col bg-white pt-5 space-y-5 px-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-medium text-sm flex flex-grow pl-3 text-black">MORE FROM NoNRML</h1>
          <Link href="/store" className="text-xs content-center border-neutral-200 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm px-2 mr-2">DISCOVER MORE</Link>
        </div>
        <div className="flex flex-row flex-wrap w-full h-full">
          {
            products.popularProducts.map( product => ( 
              <ProductCardHome  
                key={product.sku}
                image={product.productImages[0]?.image}
                hoverImage={product.productImages[1]?.image}
                name={product.name}
                sku={product.sku}
                count={product._count.ProductVariants}
                imageAlt={product.name}
                price={+product.price}
              />
            ))
          }
        </div>
      </div>


    </div> 
  )
}
