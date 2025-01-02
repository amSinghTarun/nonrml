import { connectToRedis } from "../connection/connect";

export const cacheServices = {
    redisClient: connectToRedis()!,
    customJSONIncr: async ({key, path, value=1}: {key: string, path:string|number, value?:number} ) => {
        try{
            console.log((await cacheServices.redisClient.json.get("VISITED")))
            const incrasedValue = await cacheServices.redisClient.json.numincrby( key, `$.${2}`, value );
            !incrasedValue.length && cacheServices.redisClient.json.set(key, `$.${2}`, value );
        } catch(error) {
            if( !(await cacheServices.redisClient.json.get("VISITED")) )
                cacheServices.redisClient.json.set("VISITED", "$", {[path]: value});
            console.log("\n\n\n\n\n ***** ERROR IN CACHE_SERVICEs", error);
        }
    }
};