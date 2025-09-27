"use client";

import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect } from "react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { useInView } from "react-intersection-observer";

// Lazy load ProductCard
const ProductCard = lazy(() => 
  import("@/components/cards/ProductCard").then(module => ({ default: module.ProductCard }))
);

type ProductsProps = { 
    products: RouterOutput["viewer"]["product"]["getProducts"]["data"];
    categoryName?: string;
    nextCursor: RouterOutput["viewer"]["product"]["getProducts"]["nextCursor"];
};

// Skeleton component
const ProductCardSkeleton = React.memo(() => (
  <div className="w-1/2 md:w-1/3 lg:w-1/4 p-1">
    <div className="aspect-square bg-gray-200 animate-pulse rounded" />
    <div className="h-4 bg-gray-300 animate-pulse rounded mt-2" />
    <div className="h-3 bg-gray-300 animate-pulse rounded mt-1 w-3/4" />
  </div>
));
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

const Products: React.FC<ProductsProps> = ({ 
  categoryName, 
  products: initialProducts, 
  nextCursor: initialNextCursor 
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intersection observer for infinite scroll - triggers when user nears bottom
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: '300px', // Start loading when 300px away from trigger element
  });

  const trpcUtils = trpc.useUtils();

  // Fetch more products automatically
  const fetchMoreProducts = useCallback(async () => {
    if (!nextCursor || isFetching) return;

    setIsFetching(true);
    setError(null);

    try {
      console.log('🔄 Loading more products...');
      
      const response = await trpcUtils.viewer.product.getProducts.fetch({
        categoryName: categoryName ? categoryName.replace("-", "_") : undefined,
        cursor: nextCursor
      });

      console.log(`✅ Loaded ${response.data.length} more products`);

      // Add new products to existing list
      setProducts(prev => [...prev, ...response.data]);
      setNextCursor(response.nextCursor);

    } catch (error) {
      console.error("❌ Error fetching more products:", error);
      setError("Failed to load more products. Please try again.");
    } finally {
      setIsFetching(false);
    }
  }, [nextCursor, isFetching, categoryName, trpcUtils]);

  // Automatically fetch when intersection observer triggers
  useEffect(() => {
    if (inView && nextCursor && !isFetching) {
      fetchMoreProducts();
    }
  }, [inView, fetchMoreProducts, nextCursor, isFetching]);

  // Retry function for error handling
  const retryFetch = useCallback(() => {
    setError(null);
    fetchMoreProducts();
  }, [fetchMoreProducts]);

  // Memoized header
  const formattedCategoryName = useMemo(() => 
    categoryName ? categoryName.replace("-", " ").toUpperCase() : "ALL PRODUCTS",
    [categoryName]
  );

  return (
    <div className="flex flex-col h-max">
      {/* Header */}
      <h1 className="flex mt-4 text-md lg:text-xl font-extrabold pl-4 pb-4 text-gray-700">
        {formattedCategoryName}
      </h1>
      
      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No products found
        </div>
      ) : (
        <div className="flex flex-row flex-wrap">
          {products.map((product, index) => (
            <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
              <ProductCard
                image={product.productImages[0]?.image}
                name={product.name}
                sku={product.sku}
                count={product._count.ProductVariants}
                imageAlt={product.name}
                price={+product.price}
              />
            </Suspense>
          ))}
        </div>
      )}

      {/* Infinite Scroll Trigger - This element triggers the fetch */}
      {nextCursor && (
        <div ref={ref} className="py-8 text-center">
          {isFetching && (
            <div className="flex flex-col items-center space-y-2">
              <div className="font-semibold text-sm">LOADING MORE PRODUCTS...</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={retryFetch}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                RETRY
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(Products);