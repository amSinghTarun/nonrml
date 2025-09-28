"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { GeneralButton, GeneralButtonTransparent, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/app/lib/breakpoint";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { trpc } from "@/app/_trpc/client";

// Lazy load heavy components that aren't immediately visible
const SizeChart = lazy(() => import("./SizeChart").then(module => ({ default: module.SizeChart })));
const ProductCard = lazy(() => import("./cards/ProductCard").then(module => ({ default: module.ProductCard })));

type ProductProps = RouterOutput["viewer"]["product"]["getProduct"]["data"];

// Memoize expensive operations
const convertStringToINR = (currencyString: number) => {
  return `INR ${new Intl.NumberFormat().format(currencyString)}.00`;
};

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const orderMap = Object.fromEntries(sizeOrder.map((s, i) => [s, i])) as Record<string, number>;

// Skeleton components for lazy loaded content
const ProductCardSkeleton = () => (
  <div className="aspect-square bg-gray-200 animate-pulse rounded">
    <div className="h-4 bg-gray-300 animate-pulse rounded mt-2" />
    <div className="h-3 bg-gray-300 animate-pulse rounded mt-1 w-3/4" />
  </div>
);

const SimilarProductsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-1">
    {Array.from({ length: 4 }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Memoized product details sections
const ProductDetails = React.memo(({ product }: { product: any }) => (
  <div className="flex-col text-neutral-700 flex text-[11px] md:text-xs uppercase rounded-md divide-y divide-neutral-200 space-y-4 px-3 py-4 shadow-neutral-100 shadow lg:shadow-none">
    <div className="flex lg:flex-col lg:text-center lg:space-y-1">
      <span className="font-normal lg:font-bold basis-1/3">DESCRIPTION</span>
      <div className="basis-2/3 font-light text-neutral-500 lg:px-2">{product.description}</div>
    </div>

    <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
      <span className="font-normal lg:font-bold basis-1/3">DETAILS</span>
      <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
        {product.details.map((detail: string, index: number) => (
          <p key={index} className="mb-1 last:mb-0">{detail}</p>
        ))}
      </div>
    </div>

    <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
      <span className="font-normal lg:font-bold basis-1/3">CARE</span>
      <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
        {product.care.map((detail: string, index: number) => (
          <p key={index} className="mb-1 last:mb-0">{detail}</p>
        ))}
      </div>
    </div>

    <div className="flex pt-2 justify-center lg:flex-col lg:text-center lg:space-y-1">
      <span className="font-normal basis-1/3 lg:font-bold">SHIPPING</span>
      <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
        {product.shippingDetails.map((detail: string, index: number) => (
          <p key={index} className="mb-1 last:mb-0">{detail}</p>
        ))}
      </div>
    </div>
  </div>
));
ProductDetails.displayName = 'ProductDetails';

// Optimized image carousel with better loading strategy
const ProductImageCarousel = React.memo(({ 
  images, 
  productName, 
  isScreenLg, 
  onSizeChartClick 
}: { 
  images: any[], 
  productName: string, 
  isScreenLg: boolean,
  onSizeChartClick: () => void 
}) => {
  const [loadedImages, setLoadedImages] = useState(new Set([0])); // Preload first image
  
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  }, []);

  return (
    <div className="lg:basis-1/2 2xl:basis-5/12 relative lg:min-h-screen">
      <Carousel
        plugins={[WheelGesturesPlugin("is-wheel-dragging")]}
        opts={
          isScreenLg
            ? { dragFree: true, align: "start", loop: true }
            : { dragFree: true, align: "center", loop: true }
        }
        orientation={isScreenLg ? "vertical" : "horizontal"}
        className="lg:h-screen w-full"
      >
        <CarouselContent className="w-full lg:h-screen">
          {images.map((image, index) => (
            <CarouselItem key={index} className="w-full lg:basis-1/2">
              <Image
                src={image.image}
                alt={`${productName} - Image ${index + 1}`}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 45vw"
                className="w-full h-auto sm:max-h-[600px] lg:max-h-none lg:h-auto object-cover"
                priority={index === 0} // Only prioritize first image
                loading={index === 0 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                onLoad={() => handleImageLoad(index)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className={`absolute right-1 bottom-1 ${isScreenLg && "top-1 right-0"}`}>
        <GeneralButtonTransparent
          display="Measures"
          className="p-2 px-3 rounded-full bg-white/35 text-black backdrop-blur-lg border-none w-fit text-[10px] md:text-xs"
          onClick={onSizeChartClick}
        />
      </div>
    </div>
  );
});
ProductImageCarousel.displayName = 'ProductImageCarousel';

// Memoized related products section with intersection observer
const RelatedProductsSection = React.memo(({ productId, categoryId }: { productId: number, categoryId: number }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const similarProductsRef = useRef<HTMLDivElement>(null);

  const { data: relatedProducts, isLoading } = trpc.viewer.product.getRelatedProducts.useQuery(
    { productId, categoryId },
    { 
      enabled: !!productId && !!categoryId && isIntersecting,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' } // Start loading before fully visible
    );
    
    if (similarProductsRef.current) {
      observer.observe(similarProductsRef.current);
    }
    
    return () => {
      if (similarProductsRef.current) {
        observer.unobserve(similarProductsRef.current);
      }
    };
  }, []);

  return (
    <div ref={similarProductsRef} className="w-full pt-8 pb-2 px-1">
      {isIntersecting && (
        <>
          {!isLoading && relatedProducts?.data && relatedProducts.data.length > 0 ? (
            <>
              <h2 className="text-left text-neutral-800 text-xs md:text-lg font-bold mb-3 px-2">
                YOU MAY ALSO LIKE
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-1">
                {relatedProducts.data.map((product) => (
                  <Suspense key={product.sku} fallback={<ProductCardSkeleton />}>
                    <ProductCard
                      image={product.productImages[0]?.image}
                      name={product.name.toUpperCase()}
                      sku={product.sku}
                      count={1}
                      imageAlt={product.sku}
                      price={+product.price}
                    />
                  </Suspense>
                ))}
              </div>
            </>
          ) : isLoading ? (
            <>
              <h2 className="text-left text-neutral-800 text-xs md:text-lg font-bold mb-3 px-2">
                YOU MAY ALSO LIKE
              </h2>
              <SimilarProductsSkeleton />
            </>
          ) : null}
        </>
      )}
      {!isIntersecting && <div className="h-60" />}
    </div>
  );
});
RelatedProductsSection.displayName = 'RelatedProductsSection';

const Product: React.FC<ProductProps> = ({ product, sizeData }) => {
  const { toast } = useToast();
  const [buyNow, setBuyNow] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSize, setSelectedSize] = useState<{
    [variantId: number]: {
      size: string;
      productId: number;
      productSku: string;
      quantity: number;
      productImage: string;
      productName: string;
      price: number;
    };
  }>({});

  const { setBuyNowItems } = useBuyNowItemsStore();
  const { cartItems, setCartItems } = useCartItemStore();
  const { setAppbarUtil } = useSetAppbarUtilStore();
  const isScreenLg = useBreakpoint("1024px");
  const router = useRouter();
  const sizeSKU = useRef<number>();

  // Memoize expensive calculations
  const sortedSizes = useMemo(() => {
    const arr = Object.values(sizeData);
    return arr.slice().sort(
      (a, b) => (orderMap[a.size] ?? 999) - (orderMap[b.size] ?? 999)
    );
  }, [sizeData]);

  const sortedProductImages = useMemo(
    () => [...product.productImages].sort((a, b) => a.priorityIndex - b.priorityIndex),
    [product.productImages]
  );

  const formattedPrice = useMemo(
    () => convertStringToINR(Number(product.price)),
    [product.price]
  );

  // Optimized handlers
  const handleAddToCart = useCallback(() => {
    const variantId = sizeSKU.current!;
    if (!variantId) return;

    const itemQuantity = cartItems[variantId]
      ? cartItems[variantId].quantity + 1
      : 1;

    if (itemQuantity > sizeData[variantId].quantity) {
      toast({ duration: 1500, title: "Can't add more of this size" });
      return;
    }

    const cartItem = {
      [variantId]: {
        ...selectedSize[variantId],
        quantity: itemQuantity,
        variantId,
      },
    };
    setCartItems(cartItem);
    setAppbarUtil("CART");
  }, [cartItems, selectedSize, sizeData, setCartItems, setAppbarUtil, toast]);

  const handleBuyNow = useCallback(() => {
    if (!sizeSKU.current) return;

    setBuyNowItems({
      [sizeSKU.current]: {
        ...selectedSize[sizeSKU.current],
        quantity: selectedQuantity,
        variantId: sizeSKU.current,
      },
    });
    router.push(`/checkout?purchase=1`);
  }, [selectedSize, selectedQuantity, setBuyNowItems, router]);

  const validateSizeSelection = useCallback(() => {
    if (!sizeSKU.current || !selectedSize[sizeSKU.current]?.quantity) {
      toast({ duration: 1500, title: "Please Select An Available Size" });
      return false;
    }
    return true;
  }, [selectedSize, toast]);

  const handleSizeChartOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSizeChartClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <article className="my-3 px-1 flex flex-col lg:flex-row flex-1 space-y-2 lg:space-x-3 lg:space-y-0">
        <ProductImageCarousel
          images={sortedProductImages}
          productName={product.name}
          isScreenLg={isScreenLg}
          onSizeChartClick={handleSizeChartOpen}
        />

        <div className="lg:overflow-y-auto flex flex-1 lg:pb-20 py-1 px-1 xl:justify-center">
          <div className="space-y-4 flex-col w-full 2xl:w-5/6 content-end">
            {/* Product info section */}
            <div className="flex flex-col pl-1 text-center space-y-2">
              <span className="text-neutral-800 flex flex-col text-sm lg:text-lg font-bold">
                {product.name.toUpperCase()}
              </span>
              <span className="text-neutral-700 text-xs lg:text-md font-normal flex flex-col">
                {formattedPrice}
              </span>
              {/* <span className="text-neutral-500 text-xs text-center lg:text-md font-normal flex flex-col">
                {product.inspiration}
              </span> */}
            </div>

            {/* Size selection buttons */}
            <div className="flex flex-row text-xs gap-2">
              {sortedSizes.map(({ size, variantId, quantity }, index) => (
                <SizeButton
                  key={index} // Better key for React reconciliation
                  sizeCount={sortedSizes.length}
                  sku={product.sku}
                  productId={product.id}
                  display={size}
                  price={+product.price}
                  quantity={quantity}
                  variantId={variantId}
                  name={product.name}
                  image={product.productImages[0].image}
                  selectedSize={sizeSKU}
                  setSelectedSize={setSelectedSize}
                  setQuantity={setSelectedQuantity}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-row text-xs w-full gap-2">
              {buyNow ? (
                <div className="flex flex-col w-full space-y-2">
                  <div className="flex flex-row w-full space-x-2">
                    <QuantitySelectButton
                      selectedQuantity={selectedQuantity}
                      minQuantity={1}
                      maxQuantity={selectedSize[sizeSKU.current!]?.quantity}
                      onQuantityChange={setSelectedQuantity}
                      className="shadow-neutral-200 shadow-sm"
                    />
                    <GeneralButton
                      className="h-full w-full bg-neutral-800 text-white font-bold"
                      display="CHECKOUT"
                      onClick={handleBuyNow}
                    />
                  </div>
                  <ProductPageActionButton
                    display="ADD TO CART"
                    className="shadow-neutral-200 shadow-sm"
                    onClick={() => {
                      validateSizeSelection() && handleAddToCart();
                    }}
                  />
                </div>
              ) : (
                <>
                  <ProductPageActionButton
                    display="ADD TO CART"
                    onClick={() => {
                      validateSizeSelection() && handleAddToCart();
                    }}
                  />
                  <GeneralButton
                    className="h-full w-full p-3 font-bold"
                    display="BUY IT NOW"
                    onClick={() => {
                      validateSizeSelection() && setBuyNow(true);
                    }}
                  />
                </>
              )}
            </div>

            <ProductDetails product={product} />
          </div>
        </div>

        {/* Size chart modal - lazy loaded */}
        {isModalOpen && (product.sizeChartId || product.category.sizeChartId) && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">Loading...</div>}>
            <SizeChart
              isOpen={isModalOpen}
              onClose={handleSizeChartClose}
              sizeChartCategoryNameId={product.sizeChartId ?? (product.category.sizeChartId ?? 0)}
            />
          </Suspense>
        )}
      </article>

      {/* Related products section */}
      <RelatedProductsSection productId={product.id} categoryId={product.categoryId} />
    </>
  );
};

export default React.memo(Product);