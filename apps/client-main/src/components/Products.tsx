"use client";

import React, { useEffect, useState } from "react";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { ProductCard } from "@/components/cards/ProductCard";
import { useInView } from "react-intersection-observer";

type ProductsProps = { 
    products: RouterOutput["viewer"]["product"]["getProducts"]["data"];
    categoryName?: string;
    nextCursor: RouterOutput["viewer"]["product"]["getProducts"]["nextCursor"];
};

const Products: React.FC<ProductsProps> = ({ categoryName, products: initialProducts, nextCursor: initialNextCursor }) => {
    const { ref } = useInView({onChange:(inView) => inView && fetchMoreProducts()});
    const [products, setProducts] = useState(initialProducts);
    const [nextCursor, setNextCursor] = useState(initialNextCursor);
    const [isFetching, setIsFetching] = useState(false);

    // Access the TRPC context for imperative fetching
    
    // Function to fetch more products
    const fetchMoreProducts = async () => {

        if(!nextCursor || isFetching) return;
        setIsFetching(true);

        const trpcContext = trpc.useUtils();
        try {
            const response = await trpcContext.viewer.product.getProducts.fetch({
                categoryName: categoryName ?? undefined,
                cursor: nextCursor
            });
            setProducts((prev) => [...prev, ...response.data]);
            setNextCursor(response.nextCursor);
            setIsFetching(false);
        } catch (error) {
            setIsFetching(false);
            console.error("Error fetching more products:", error);
        }
    };

    return (
        <div className="flex flex-col h-max">
            {<h1 className="flex mt-4 text-black text-2xl lg:text-4xl font-extrabold pl-4 pb-4">
                {categoryName ? categoryName.replace("_", " ").toUpperCase() : "ALL PRODUCTS"}
            </h1>}
            <div className="flex flex-row flex-wrap">
                { products.map( (product) => (
                    <ProductCard
                        key={product.id}
                        image={product.productImages[0]?.image}
                        name={product.name}
                        sku={product.sku}
                        count={product._count.ProductVariants}
                        imageAlt={product.name}
                        price={+product.price}
                    />
                )) }
            </div>
            {nextCursor && (
                <div ref={nextCursor ? ref : null}>
                    {isFetching && <div className="text-center font-semibold text-sm pb-4">LOADING MORE PRODUCTS...</div>}
                </div>
            )}
        </div>
    );
};

export default Products;
