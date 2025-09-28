import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import symbol from "@/images/SYMBOL.png"; // Add this import
import { getHomepageProducts, getHomePagesImages } from "@/app/actions/product.action";
import { ProductCardHome } from "@/components/cards/ProductCard";
import { ResponsiveProductImage, ResponsiveImageGallery, ResponsiveImage } from "../ScreenResponsiveImage";

// Lazy load non-critical components
const Footer = dynamic(() => import('../Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <FooterSkeleton />
});

const TickerText = dynamic(() => import('./TicketText').then(mod => ({ default: mod.TickerText })), {
  loading: () => <TickerSkeleton />
});

const NoNRMLFaceCard = dynamic(() => import('./Facecard'), {
  loading: () => <FaceCardSkeleton />
});

// Skeleton Components
const ProductsSkeleton = () => (
  <div className="flex flex-row flex-wrap w-full h-full px-1">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="w-1/2 md:w-1/4 p-2">
        <div className="aspect-square bg-gray-200 animate-pulse rounded" />
        <div className="h-4 bg-gray-200 animate-pulse rounded mt-2" />
        <div className="h-3 bg-gray-200 animate-pulse rounded mt-1 w-1/2" />
      </div>
    ))}
  </div>
);

const FooterSkeleton = () => (
  <div className="h-32 bg-gray-200 animate-pulse" />
);

const TickerSkeleton = () => (
  <div className="h-8 bg-gray-200 animate-pulse w-full" />
);

const FaceCardSkeleton = () => (
  <div className="w-full h-64 bg-gray-200 animate-pulse" />
);

const ImageGallerySkeleton = () => (
  <div className="grid grid-cols-2 gap-4 p-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
    ))}
  </div>
);

// Separate components for better code splitting
const HeroSection = ({ homeImages }: { homeImages: any }) => (
  <>
    <ResponsiveImage
      images={{
        md: homeImages["TOP_MD"] as string,
        lg: homeImages["TOP_LG"] as string
      }}
      alt="homeImage"
      className="w-screen h-screen fixed"
      sizes="100vw"
      priority={true}
      lgBreakpoint={1024}
    />

    <ResponsiveImage
      images={{
        md: homeImages["TOP_2_MD"] as string,
        lg: homeImages["TOP_2_LG"] as string
      }}
      alt="homeImage"
      className="w-screen h-screen z-30 relative"
      sizes="100vw"
      priority={true}
      lgBreakpoint={1024}
    />
    <div className="h-screen overscroll-auto bg-transparent w-full" />
  </>
);

const LatestProductsSection = ({ products }: { products: any }) => (
  <div className="z-30 relative w-full flex flex-1 flex-col backdrop-blur-xl bg-black/20 pt-3 space-y-3 pb-1">
    <div className="flex flex-row w-full align-baseline">
      <h1 className="font-bold text-xs flex flex-grow pl-3 text-black">LATEST DROP</h1>
    </div>
    <Suspense fallback={<ProductsSkeleton />}>
      <div className="flex flex-row flex-wrap w-full h-full px-1">
        {products.latestProducts.map((product: any) => (
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
        ))}
      </div>
    </Suspense>
  </div>
);

const MoreProductsSection = ({ products }: { products: any }) => (
  <div className="z-30 relative w-full flex flex-1 flex-col bg-white pt-5 space-y-5 px-1">
    <div className="flex flex-row w-full align-baseline">
      <h1 className="font-bold text-xs flex flex-grow pl-3 text-black">MORE FROM NoNRML</h1>
      <Link 
        href="/collections" 
        className="text-xs content-center border-neutral-200 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm px-2 mr-2"
        prefetch={false}
      >
        DISCOVER MORE
      </Link>
    </div>
    <Suspense fallback={<ProductsSkeleton />}>
      <div className="flex flex-row flex-wrap w-full h-full">
        {products.popularProducts.map((product: any) => (
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
        ))}
      </div>
    </Suspense>
    <div className="flex z-30 relative pb-7 md:pb-8 flex-col items-center justify-center w-full h-full">
      <Link 
        href="/collections" 
        className="text-xs content-center w-fit border-neutral-300 border font-normal text-neutral-400 hover:text-neutral-800 rounded-sm p-3"
        prefetch={false}
      >
        DISCOVER MORE
      </Link>
    </div>
  </div>
);

export async function LandingPage() {
  const startTime = performance.now();
  
  // Parallel data fetching
  const [products, homeImages] = await Promise.all([
    getHomepageProducts(),
    getHomePagesImages()
  ]);
  
  const dataFetchTime = performance.now() - startTime;
  console.log(`Landing page data fetch time: ${dataFetchTime}ms`);

  return (
    <div className="w-screen h-full">
      {/* Hero Section - Above the fold, load immediately */}
      <HeroSection homeImages={homeImages} />

      {/* Latest Products Section */}
      <LatestProductsSection products={products} />

      {/* Ticker Text - Lazy loaded */}
      <div className="flex z-30 relative bg-black justify-center w-full h-full text-center text-sm sm:text-base md:text-xl">
        <Suspense fallback={<TickerSkeleton />}>
          <TickerText />
        </Suspense>
      </div>

      {/* Middle Image Section with Symbol Overlay */}
      <div className="z-30 relative flex flex-col lg:flex-col">
        <div className="relative">
          <ResponsiveProductImage 
            imageLg={homeImages.MIDDLE_LG as string} 
            imageMd={homeImages.MIDDLE_MD as string} 
          />
          
          {/* Symbol Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="backdrop-blur-xl bg-white/10 rounded-full p-6 md:p-8 lg:p-12">
              <Image
                src={symbol}
                alt="NoNRML Symbol"
                width={80}
                height={80}
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* More Products Section */}
      <MoreProductsSection products={products} />

      {/* Bottom Gallery and Footer - Lazy loaded */}
      <div>
        <Suspense fallback={<ImageGallerySkeleton />}>
          <ResponsiveImageGallery images={homeImages.BOTTOM as string[]} />
        </Suspense>
        <Suspense fallback={<FooterSkeleton />}>
          <Footer className="z-30 relative text-white bg-black/45 backdrop-blur-md border-none" />
        </Suspense>
      </div>
    </div> 
  );
}