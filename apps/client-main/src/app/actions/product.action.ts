"use server"

import { serverClient } from "../_trpc/serverClient"
import { RouterOutput } from "@/app/_trpc/client";
import { cacheServicesRedisClient } from "@nonrml/cache";

type HomeProductsType = RouterOutput["viewer"]["product"]["getHomeProducts"]["data"];
type HomeImages = RouterOutput["viewer"]["homeImages"]["getHomeImages"]["data"];

export const getHomepageProducts = async () => {

    let latestProducts    : HomeProductsType["latestProducts"]    | null = await cacheServicesRedisClient().get("latestProducts");
    let popularProducts   : HomeProductsType["popularProducts"]   | null = await cacheServicesRedisClient().get("popularProducts");
    let exculsiveProducts : HomeProductsType["exclusiveProducts"] | null = await cacheServicesRedisClient().get("exclusiveProducts");
    
    console.log("latestProducts", latestProducts?.length)

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

    return { latestProducts: latestProducts!, popularProducts: popularProducts!, exculsiveProducts: exculsiveProducts! };
}

export const getHomePagesImages = async () => {
    let homeImages : HomeImages | null = await cacheServicesRedisClient().get("homeImages");
    if(!homeImages){
        console.log("Didn't get cache")
        const homeImagesData = await (await serverClient()).viewer.homeImages.getHomeImages()
        if(homeImagesData?.data){
            homeImages = homeImagesData?.data;
        }
    };
    return homeImages!;
};