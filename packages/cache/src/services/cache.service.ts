import { connectToRedis } from "../connection/connect";

export const cacheServicesRedisClient = () => connectToRedis()!;

export const customCacheJSONIncr = async ({key, path, value=1}: {key: string, path:string|number, value?:number} ) => {
    try{
        console.log((await cacheServicesRedisClient().json.get("VISITED")))
        const incrasedValue = await cacheServicesRedisClient().json.numincrby( key, `$.${2}`, value );
        !incrasedValue.length && cacheServicesRedisClient().json.set(key, `$.${2}`, value );
    } catch(error) {
        if( !(await cacheServicesRedisClient().json.get("VISITED")) )
            cacheServicesRedisClient().json.set("VISITED", "$", {[path]: value});
        console.log("\n\n\n\n\n ***** ERROR IN CACHE_SERVICEs", error);
    }
}