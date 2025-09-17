"use client"

import Image from "next/image";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { GeneralButton, GeneralButtonTransparent, ProductPageActionButton, QuantitySelectButton, SizeButton } from "./ui/buttons";
import { RouterOutput } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import { useSetAppbarUtilStore, useBuyNowItemsStore, useCartItemStore } from "@/store/atoms"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/app/lib/breakpoint";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { SizeChart } from "./SizeChart";
import { trpc } from "@/app/_trpc/client";
import { ProductCard } from "./cards/ProductCard";

type ProductProps = RouterOutput["viewer"]["product"]["getProduct"]["data"];

const convertStringToINR = (currencyString: number) => {
  let INR = new Intl.NumberFormat();
  return `INR ${INR.format(currencyString)}.00`;
};

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const orderMap = Object.fromEntries(sizeOrder.map((s, i) => [s, i])) as Record<string, number>;

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

  const [isIntersecting, setIsIntersecting] = useState(false);
  const similarProductsRef = useRef<HTMLDivElement>(null);

  const { data: relatedProducts, isLoading } =
    trpc.viewer.product.getRelatedProducts.useQuery(
      { productId: product.id, categoryId: product.categoryId },
      { enabled: !!product.id && !!product.categoryId && isIntersecting }
    );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (similarProductsRef.current) observer.observe(similarProductsRef.current);
    return () => {
      if (similarProductsRef.current) observer.unobserve(similarProductsRef.current);
    };
  }, []);

  // Sort sizes XS → XXL; unknown sizes go to the end
  const sortedSizes = useMemo(() => {
    const arr = Object.values(sizeData);
    return arr.slice().sort(
      (a, b) => (orderMap[a.size] ?? 999) - (orderMap[b.size] ?? 999)
    );
  }, [sizeData]);

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

  const sortedProductImages = useMemo(
    () => [...product.productImages].sort((a, b) => a.priorityIndex - b.priorityIndex),
    [product.productImages]
  );

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

  return (
    <>
      <article className="my-3 px-1 flex flex-col lg:flex-row flex-1 space-y-2 lg:space-x-3 lg:space-y-0">
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
              {sortedProductImages.map((image, key) => (
                <CarouselItem key={key} className="w-full lg:basis-1/2">
                  <Image
                    src={image.image}
                    alt={product.name}
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-[550px] lg:h-auto object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className={`absolute right-1 bottom-1 ${isScreenLg && "top-1 right-0"}`}>
            <GeneralButtonTransparent
              display="Measures"
              className={`p-2 px-3 rounded-full bg-white/35 text-black backdrop-blur-lg border-none w-fit text-[10px] md:text-xs ${isModalOpen && "opacity-0"}`}
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>

        <div className="lg:overflow-y-auto flex flex-1 lg:pb-20 py-1 px-1 xl:justify-center">
          <div className="space-y-4 flex-col w-full 2xl:w-5/6 content-end">
            <div className="flex flex-col pl-1 text-center space-y-2">
              <span className="text-neutral-800 flex flex-col text-sm lg:text-lg font-bold">
                {product.name.toUpperCase()}
              </span>
              <span className="text-neutral-700 text-xs lg:text-md font-normal flex flex-col">
                {convertStringToINR(Number(product.price))}
              </span>
              <span className="text-neutral-500 text-xs text-center lg:text-md font-normal flex flex-col">
                {product.inspiration}
              </span>
            </div>

            {/* Size selection buttons (sorted) */}
            <div className="flex flex-row text-xs gap-2">
              {sortedSizes.map(({ size, variantId, quantity }, index) => (
                <SizeButton
                  key={index}
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

            <div className="flex-col text-neutral-700 flex text-[11px] md:text-xs uppercase rounded-md divide-y divide-neutral-200 space-y-4 px-3 py-4 shadow-neutral-100 shadow lg:shadow-none">
              <div className="flex lg:flex-col lg:text-center lg:space-y-1">
                <span className="font-normal lg:font-bold basis-1/3 ">
                  DESCRIPTION
                </span>
                <div className="basis-2/3 font-light text-neutral-500 lg:px-2">{`${product.description}`}</div>
              </div>

              <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
                <span className="font-normal lg:font-bold basis-1/3">DETAILS</span>
                <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
                    {product.details.map((detail, index) => (
                      <p key={index} className="mb-1 last:mb-0">
                        {detail}
                      </p>
                    ))}
                </div>
              </div>

              <div className="flex pt-2 lg:flex-col lg:text-center lg:space-y-1">
                <span className="font-normal lg:font-bold basis-1/3 ">CARE</span>
                <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
                  {product.care.map((detail, index) => (
                    <p key={index} className="mb-1 last:mb-0">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex pt-2 justify-center lg:flex-col lg:text-center lg:space-y-1">
                <span className="font-normal basis-1/3 lg:font-bold ">SHIPPING</span>
                <div className="basis-2/3 font-light text-neutral-500 lg:px-2">
                  {product.shippingDetails.map((detail, index) => (
                    <p key={index} className="mb-1 last:mb-0">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (product.sizeChartId || product.category.sizeChartId) && (
          <SizeChart
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            sizeChartCategoryNameId={product.sizeChartId ?? (product.category.sizeChartId ?? 0)}
          />
        )}
      </article>

      <div ref={similarProductsRef} className="w-full pt-8 pb-2 px-1">
        {!isLoading && isIntersecting && relatedProducts && relatedProducts.data.length > 0 && (
          <>
            <h2 className="text-left text-neutral-800 text-xs md:text-lg font-bold mb-3 px-2">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-1">
              {relatedProducts.data.map((product) => (
                <ProductCard
                  key={product.sku}
                  image={product.productImages[0]?.image}
                  name={product.name.toUpperCase()}
                  sku={product.sku}
                  count={1}
                  imageAlt={product.sku}
                  price={+product.price}
                />
              ))}
            </div>
          </>
        )}
        {(isLoading || !isIntersecting) && <div className="h-60" />}
      </div>
    </>
  );
};

export default React.memo(Product);