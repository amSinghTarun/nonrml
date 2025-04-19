"use client"
import { trpc } from '@/app/_trpc/client';
import { Product } from "@/components/product/Product";

const ProductContainer = ({ productSku }: { productSku: string }) => {
    const product = trpc.viewer.product.getAdminProduct.useQuery(
        { productSku },
        {
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
        }
    );

    return (
        <>
            {product.data && <Product productDetails={product} />}
            {product.isLoading && <div>Loading...</div>}
            {product.error && <div>Error: {product.error.message}</div>}
        </>
    );
};

export default ProductContainer;