import React from "react";
import { MaskContainer } from "../ui/svg-mask-effect";
import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo.png";
import { getHomePagesImages, getHomepageProducts } from "@/app/actions/product.action";
import { ProductCardHome } from "@/components/cards/ProductCard";
import NoNRMLFaceCard from "./Facecard";
import { TickerText } from "./TicketText";
import {ResponsiveProductImage, ResponsiveImageGallery, ResponsiveImage} from "../ScreenResponsiveImage";
import { Footer } from "../Footer";


export async function LandingPage() {
  
  let products = await getHomepageProducts();
  let homeImages = await getHomePagesImages();

  return (
    <div  className="w-screen h-full">


      <ResponsiveImage
        images={{
          md: homeImages["TOP_MD"] as string,
          lg: homeImages["TOP_LG"] as string
        }}
        alt="homeImage"
        className="w-screen h-screen fixed"
        sizes="100vw"
        lgBreakpoint={1024} // This is the default value, can be adjusted as needed
      />

     {/* <div className="fixed inset-0 z-20 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-3/4 max-h-[600px]">
          <iframe
            allowTransparency={true}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
            src="https://app.endlesstools.io/embed/d06218b1-9b71-4531-a0ae-0487bd79ff5e"
            title="Endless Tools Editor"
            frameBorder="0"
            allow="clipboard-write; encrypted-media; gyroscope; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div> */}

      <ResponsiveImage
        images={{
          md: homeImages["TOP_2_MD"] as string,
          lg: homeImages["TOP_2_LG"] as string
        }}
        alt="homeImage"
        className="w-screen h-screen z-30 relative"
        sizes="100vw"
        lgBreakpoint={1024} // This is the default value, can be adjusted as needed
      />
      <div className="h-screen overscroll-auto bg-transparent w-full " />
      
      <div className="z-30 relative w-full flex flex-1 flex-col backdrop-blur-xl bg-black/20 pt-3 space-y-3 pb-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-bold text-xs flex flex-grow pl-3 text-black">LATEST DROP</h1>
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
              </>
            ))
          }
        </div>
      </div>

      <div className={`flex z-30 relative bg-black justify-center w-full h-full text-center text-sm sm:text-base md:text-xl`}>
        <TickerText />
      </div>

      <div className="z-30 relative flex flex-col lg:flex-col">
          {/* <MaskContainer
            revealText={
              <p className="w-2/5 md:w-1/6 lg:w-1/8 flex h-fit">
                <Image
                    src={logo}
                    alt="No NRML logo"
                    priority
                    width={0} height={0}
                    sizes="100vw" 
                    // can't use backdrop-blur
                    className='h-full w-auto p-10 object-cover justify-center bg-white bg-opacity-80 rounded-md'
                ></Image>
              </p> 
            }
            className=" w-full text-sm h-full cursor-vertical-text fixed text-center items-center content-center justify-center"
          >
            <NoNRMLFaceCard />
          </MaskContainer> */}
          <ResponsiveProductImage imageLg={homeImages.MIDDLE_LG as string} imageMd={homeImages.MIDDLE_MD as string} />
      </div>

      <div className="z-30 relative w-full flex flex-1 flex-col bg-white pt-5 space-y-5 px-1">
        <div className="flex flex-row w-full align-baseline">
          <h1 className=" font-bold text-xs flex flex-grow pl-3 text-black">MORE FROM NoNRML</h1>
          <Link href="/collections" className="text-xs content-center border-neutral-200 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm px-2 mr-2">DISCOVER MORE</Link>
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
              </>
            ))
          }
        </div>
        <div className="flex z-30 relative pb-7 md:pb-8 flex-col items-center justify-center w-full h-full">
          <Link href="/collections" className="text-xs content-center w-fit border-neutral-300 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm p-3 ">DISCOVER MORE</Link>
        </div>
      </div>

        <div> 
          <ResponsiveImageGallery images={homeImages.BOTTOM as string[]}/>
          <Footer className="z-30 relative text-white bg-black/45 backdrop-blur-md border-none"></Footer>
        </div>

    </div> 
  )
}
