import { Vortex } from "../ui/vortex";
import { FlipWords } from "../ui/flip-words";
import React from "react";
import { HeroParallax } from "../ui/hero-parallax";
import { MaskContainer } from "../ui/svg-mask-effect";
import Image from "next/image";
import homeImage from "../../images/AMI_4024-Edit-2_1668x2500_crop_center.jpg"
import Link from "next/link";
// import logo from "@/images/logo.png"
const words = ["NORMAL", "STANDARD", "USUAL", "ORDINARY", "COMMON"];
import { getHomepageProducts } from "@/app/actions/product.action";

export async function HomeDisplayText() {
  let products = await getHomepageProducts();

  return (
    <div  className="w-screen h-full">
    <Image  className=" w-screen h-screen fixed" sizes="100vh" src={homeImage} height={100} width={100} alt="homeImage" />

      <MaskContainer
        revealText={
          <p className="max-w-4xl mx-auto bg-white/60 p-5 text-center">
            LOGO
            {/* <Image
                src={logo}
                alt="No NRML logo"
                priority
                width={0} height={0} 
                sizes="100vw" 
                style={{ color:"white",width: 'auto', height: "40px"}}
            ></Image> */}
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
      <HeroParallax products={[...products, ...products, ...products, ...products]} />
      <div className=" w-full h-auto overflow-hidden">
        <Vortex
          backgroundColor="white"
          className="flex items-center border-t border-black flex-col justify-center px-4 md:px-10 py-4 w-full h-full"
        >
          <h2 className="text-black bg-transparent text-2xl md:text-6xl font-bold text-center">
            {`ALL IT TAKES IS A NO TO REDEFINE WHAT IS `}
            <FlipWords className="text-rose-500" words={words} /> <br />
          </h2>
        </Vortex>
      </div>
      <div className="h-[600px] relative backdrop-blur-xl w-full flex justify-center items-center ">
        <Link href="/" className="relative rounded-lg bg-white shadow-0 shadow-black text-black flex flex-col w-[90%] lg:w-[50%] h-auto p-2 py-7 space-y-5">
          <div className="items-center flex justify-center basis-1/3 text-3xl font-bold" >Exclusive Drop :)</div>
          <div className="justify-center text-md font-medium items-center flex flex-col basis-2/3">
            <span >A Brand New Exclusive Product Is Live! </span>
            <span >{`Hurry Up!  BUY NOW!`}</span>
          </div>
        </Link>
      </div>
      <div className="h-[500px] z-30 relative w-full flex flex-1 flex-col bg-white px-3 py-5 space-y-5 pb-16">
        <h1 className="font-medium text-md">MORE FROM NoNRML</h1>
        <div className="flex flex-row flex-wrap w-full h-full gap-2">
          <button className="p-10 bg-red-100 text-black flex-grow">Exclusive drop</button>
          <button className="p-10 bg-red-100 text-black flex-grow">Exclusive drop</button>
          <button className="p-10 bg-red-100 text-black flex-grow">Exclusive drop</button>
          <button className="p-10 bg-red-100 text-black flex-grow">Exclusive drop</button>
        </div>
        <div className="flex justify-center items-center w-full pt-7">
          <Link href="/" className=" p-10 text-black hover:bg-black hover:text-white shadow-md shadow-black rounded-xl justify-center items-center">DISCOVER MORE</Link>
        </div>
      </div>

    </div> 
  )
}
