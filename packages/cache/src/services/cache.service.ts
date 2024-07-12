import { connectToRedis } from "../connection/connect";

export const cacheServices = {
    initializeRedisConnection: async () => {
        const redisConnection = await connectToRedis();
        return redisConnection;
    },
    getStringByName: async (name: string) : Promise<string | null> => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        return await redisConnection.get(name);
    },
    setStringByName: async (name: string, value: string, expirySeconds?: number) => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        expirySeconds ? await redisConnection.set(name, value, {EX: expirySeconds}) : await redisConnection.set(name, value);
        return;
    },
    deleteByName: async (name: string) => {
        const redisConnection = await cacheServices.initializeRedisConnection();
        await redisConnection.del(name);
    }
}