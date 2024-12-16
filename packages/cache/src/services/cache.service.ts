import { connectToRedis } from "../connection/connect";

export const cacheServices = {
    initializeRedisConnection: async () => (await connectToRedis()),
    getString: async (name: string) : Promise<string | null> => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        return await redisConnection.get(name);
    },
    setString: async (name: string, value: string, expirySeconds?: number) => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        expirySeconds ? await redisConnection.set(name, value, {EX: expirySeconds}) : await redisConnection.set(name, value);
        return;
    },
    deleteString: async (name: string) => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        await redisConnection.del(name);
    },
    getSetsMembers: async (name: string) : Promise<any>=> {
        const redisConnection = await cacheServices.initializeRedisConnection();
        const cachedResult = await redisConnection.smembers(name);
        return cachedResult;
    },
    addSets: async (name: string, set:string[] | string) => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        await redisConnection.sadd(name, ...set);
    }, 
};