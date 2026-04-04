import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { getHomepageProducts, getHomePagesImages } from "@/app/actions/product.action";
import { ProductCardHome } from "@/components/cards/ProductCard";
import { ResponsiveProductImage, ResponsiveImage } from "../ScreenResponsiveImage";
import { WhyNoNRML } from "./WhyNoNRML";
import StableViewport from "./StableViewport";

const ScrollManifesto = dynamic(() => import('./ScrollManifesto'), {
  loading: () => <div className="h-[200px] bg-white" />
});

// Lazy load non-critical components
const Footer = dynamic(() => import('../Footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <FooterSkeleton />
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

// Separate components for better code splitting
const HeroSection = ({ homeImages }: { homeImages: any }) => (
  <>
    {/* Container for TOP_MD image with symbol overlay */}
    <div className="w-screen h-screen-stable fixed overflow-hidden">
      <ResponsiveImage
        images={{
          md: homeImages["TOP_MD"] as string,
          lg: homeImages["TOP_LG"] as string
        }}
        alt="homeImage"
        className="w-screen h-screen-safe"
        sizes="100vw"
        priority={true}
        lgBreakpoint={1024}
      />

      {/* Animated Symbol Overlay */}
    </div>

    <ResponsiveImage
      images={{
        md: homeImages["TOP_2_MD"] as string,
        lg: homeImages["TOP_2_LG"] as string
      }}
      alt="homeImage"
      className="w-screen h-screen-stable z-30 relative"
      sizes="100vw"
      priority={true}
      lgBreakpoint={1024}
    />

    <div className="h-screen-stable overscroll-auto bg-transparent w-full" />
  </>
);

const LatestProductsSection = ({ products }: { products: any }) => (
  <div className="z-30 relative w-full flex flex-1 flex-col backdrop-blur-xl bg-black/20 pt-3 space-y-3 pb-1">
    <div className="flex flex-row w-full align-baseline">
      <h1 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-white pl-3">Latest Drop</h1>
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
    <div className="flex flex-row w-full items-center justify-between px-3">
      <h1 className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-900">More from NoNRML</h1>
      <Link
        href="/collections"
        className="text-[9px] tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors duration-300"
        prefetch={false}
      >
        Discover More
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
      {/* Lock viewport height on mount to prevent mobile chrome resize jumps */}
      <StableViewport />

      {/* Hero Section - Above the fold, load immediately */}
      <HeroSection homeImages={homeImages} />

      {/* Latest Products Section */}
      <LatestProductsSection products={products} />

      {/* Scroll Manifesto */}
      <ScrollManifesto />

      {/* Middle Image Section */}
      <div className="z-30 relative bg-white p-2">
        <div className="rounded-xl overflow-hidden">
          <ResponsiveProductImage
            imageLg={homeImages.MIDDLE_LG as string}
            imageMd={homeImages.MIDDLE_MD as string}
          />
        </div>
      </div>

      {/* More Products Section */}
      <MoreProductsSection products={products} />


      {/* Bottom section */}
      <div className="z-30 relative">
        {/* Minimal Expandable Why NoNRML Section */}
        <div className="z-30 relative">
          <WhyNoNRML />
        </div>

        {/* Footer — inline, scrolls with page */}
        <div className="z-30 relative">
          <Footer className="relative z-30 bg-black/40 backdrop-blur-xl" />
        </div>
      </div>
    </div>
  );
}