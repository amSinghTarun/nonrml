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

export const preloadHomepageData = async (): Promise<void> => {
    
    try {
      console.log('🚀 Starting homepage data preload...');
      
      // STEP 1: Parallel execution - fetch both products and images simultaneously
      // This is much faster than fetching them one by one
      const [productsResult, imagesResult] = await Promise.allSettled([
        getHomepageProducts(), // Fetches latest, popular, and exclusive products
        getHomePagesImages()   // Fetches all homepage hero and gallery images
      ]);
      
      // STEP 2: Check results and handle any failures gracefully
      if (productsResult.status === 'fulfilled') {
        console.log('✅ Products preloaded successfully');
        console.log(`📊 Preloaded: ${productsResult.value.latestProducts?.length || 0} latest, ${productsResult.value.popularProducts?.length || 0} popular, ${productsResult.value.exculsiveProducts?.length || 0} exclusive products`);
      } else {
        console.error('❌ Products preload failed:', productsResult.reason);
      }
      
      if (imagesResult.status === 'fulfilled') {
        console.log('✅ Images preloaded successfully');
        console.log('📸 Homepage images cached and ready');
      } else {
        console.error('❌ Images preload failed:', imagesResult.reason);
      }
      
      console.log('✅ Homepage data preload completed');
      
    } catch (error) {
      console.error('❌ Homepage data preload failed:', error);
    }
  };
  