import { FlipWords } from "../ui/flip-words";
import React from "react";
import { MaskContainer } from "../ui/svg-mask-effect";
import Image from "next/image";
import homeImage from "../../images/AMI_4024-Edit-2_1668x2500_crop_center.jpg"
import Link from "next/link";
import logo from "@/images/logo.png";
const words = ["NORMAL", "STANDARD", "USUAL", "ORDINARY", "COMMON"]; 
import { getHomepageProducts } from "@/app/actions/product.action";
import { ProductCardHome } from "@/components/cards/ProductCard";
import NoNRMLFaceCard from "./Facecard";
import { Permanent_Marker } from "next/font/google"

const appFont = Permanent_Marker({subsets: ["latin"], weight:["400"]});

export async function LandingPage() {
  let products = await getHomepageProducts();

  return (
    <div  className="w-screen h-full">


      <Image  className=" w-screen h-screen fixed" sizes="100vh" src={homeImage} height={100} width={100} alt="homeImage" />
      <MaskContainer
        revealText={
          <p className="w-fit flex
           h-fit bg-none p-5 text-center items-center content-center justify-center">
            <Image
                src={logo}
                alt="No NRML logo"
                priority
                width={0} height={0}
                sizes="100vw" 
                className='h-auto w-4/5 md:w-1/3 lg:w-1/4 bg-red-300 p-0 object-cover text-center items-center content-center justify-center'
            ></Image>
          </p>
        }
        className=" w-auto text-sm fixed text-center items-center content-center justify-center"
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

      <div className="h-screen overscroll-auto bg-transparent w-full " />
      
      <div className="z-30 relative w-full flex flex-1 flex-col backdrop-blur-xl bg-black/20 pt-3 space-y-3 pb-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-medium text-xs flex flex-grow pl-3 text-black">LATEST DROP</h1>
        </div>
        <div className="flex flex-row flex-wrap w-full h-full px-1">
          {
            products.latestProducts.map( product => ( 
              <>
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
              </>
            ))
          }
        </div>
      </div>

      <div className={`flex z-30 ${appFont.className} relative py-4 md:py-5 text-neutral-800 bg-white justify-center w-full h-full text-center text-base sm:text-sm md:text-xl `}>
        <h2>
          <span>{`ALL IT TAKES IS A `} </span>
          <span className="text-rose-500">NO</span>
          <span>{` TO REDEFINE WHAT IS`}</span>
          <FlipWords className="text-rose-500" words={words} />
        </h2>
      </div>

      <div className="z-30 relative flex flex-col lg:flex-row">
        <div className="bg-red-100 basis-1/2 flex">
          <div className="h-[400px] lg:h-[600px] relative w-full">
            {/* Modified image container to use relative positioning and proper containment */}
            <Image 
              src={products.popularProducts[0].productImages[0].image} 
              alt={"Product Image"} 
              className="object-cover w-full h-full" 
              width={1000} 
              height={1000}
            />
          </div>
        </div>
        <div className="text-white flex basis-1/2">
          <NoNRMLFaceCard />
        </div>
      </div>

      <div className="z-30 relative w-full flex flex-1 flex-col bg-white pt-5 space-y-5 px-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-medium text-xs flex flex-grow pl-3 text-black">MORE FROM NoNRML</h1>
          <Link href="/store" className="text-xs content-center border-neutral-200 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm px-2 mr-2">DISCOVER MORE</Link>
        </div>
        <div className="flex flex-row flex-wrap w-full h-full">
          {
            products.popularProducts.map( product => ( 
              <>
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
              </>
            ))
          }
        </div>
        <div className="flex z-30 relative pb-7 md:pb-8 flex-col items-center justify-center w-full h-full">
          <Link href="/store" className="text-xs content-center w-fit border-neutral-300 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm p-3 ">DISCOVER MORE</Link>
        </div>
      </div>


    </div> 
  )
}
