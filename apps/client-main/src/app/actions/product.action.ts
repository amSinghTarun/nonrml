"use server"

import { serverClient } from "../_trpc/serverClient"
import { RouterOutput } from "@/app/_trpc/client";
import { redis } from "@nonrml/cache";
import { TRPCError } from "@trpc/server";

type HomeProductsType = RouterOutput["viewer"]["product"]["getHomeProducts"]["data"];
type HomeImages = RouterOutput["viewer"]["homeImages"]["getHomeImages"]["data"];

export const getHomepageProducts = async () => {

    let latestProducts    : HomeProductsType["latestProducts"]    | null = await redis.redisClient.get("latestProducts");
    let popularProducts   : HomeProductsType["popularProducts"]   | null = await redis.redisClient.get("popularProducts");
    let exculsiveProducts : HomeProductsType["exclusiveProducts"] | null = await redis.redisClient.get("exclusiveProducts");

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

    return { latestProducts: latestProducts!, popularProducts: popularProducts!, exculsiveProducts: exculsiveProducts! };
}

export const getHomePagesImages = async () => {
    let homeImages : HomeImages | null = await redis.redisClient.get("homeImages");
    if(!homeImages){
        console.log("Didn't get cache")
        const homeImagesData = await (await serverClient()).viewer.homeImages.getHomeImages()
        if(homeImagesData?.data){
            homeImages = homeImagesData?.data;
        }
    };
    return homeImages!;
};