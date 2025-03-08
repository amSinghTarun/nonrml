"use server"

import { serverClient } from "../_trpc/serverClient"
import { RouterOutput } from "@/app/_trpc/client";
import { redis } from "@nonrml/cache";
import { TRPCError } from "@trpc/server";

type HomeProductsType = RouterOutput["viewer"]["product"]["getHomeProducts"]["data"];

export const getHomepageProducts = async () => {

    let latestProducts : HomeProductsType["latestProducts"] | null =        null;//await redis.redisClient.get("latestProducts");
    let popularProducts : HomeProductsType["popularProducts"] | null =      null;//await redis.redisClient.get("popularProducts");
    let exculsiveProducts : HomeProductsType["exclusiveProducts"] | null =  null;//await redis.redisClient.get("exclusiveProducts");

    if( !latestProducts || !popularProducts || !exculsiveProducts ){

        let { data } = await (await serverClient()).viewer.product.getHomeProducts({
            latest: latestProducts ? false : true,
            exclusive: exculsiveProducts ? false : true,
            popular: popularProducts ? false : true
        });
    
        latestProducts = latestProducts ?? data.latestProducts;
        exculsiveProducts = exculsiveProducts ?? data.exclusiveProducts
        popularProducts = popularProducts ?? data.popularProducts
    }
    
    let homePageNewProducts = latestProducts?.map((product) => {
        return {
            title: product.name,
            link: `/products/${product.sku.toLowerCase()}`,
            thumbnail: product?.productImages[0].image
        }
    });

    return { homePageNewProducts: homePageNewProducts!, popularProducts: popularProducts!, exculsiveProducts: exculsiveProducts! };
}

// export const getExchangeProductSizes = async ( exchangeProducts: NonNullable<OrderProduct>["orderProducts"] ) => {
//     // const session = await getSession();
//     // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
//     const productIdsJson : { [productId: number] : 1 }= {};
//     const productIds : number[] = []
//     for(let exchangeProduct of exchangeProducts){
//         if(!productIdsJson[exchangeProduct.productVariant.productId]){
//             productIds.push(exchangeProduct.productVariant.productId);
//         }
//         productIdsJson[exchangeProduct.productVariant.productId] = 1;
//     }
//     let { data } = await (await serverClient()).viewer.product.getProductSizes(productIds);
//     return data;
// };