import { connectToRedis } from "../connection/connect";

export const cacheServicesRedisClient = () => connectToRedis()!;

export const customCacheJSONIncr = async ({key, path, value=1}: {key: string, path:string|number, value?:number} ) => {
    try{
        const result = await cacheServicesRedisClient().json.numincrby( key, `$['${path}']`, value );
        if( result[0] == null ){
            await cacheServicesRedisClient().json.set(key, `$['${path}']`, value);
        }
    } catch {
        await cacheServicesRedisClient().json.set(key, "$", {[path]: value}).catch(() => {});
    }
}