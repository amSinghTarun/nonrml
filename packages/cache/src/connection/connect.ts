import { Redis } from "@upstash/redis"
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/cache/.env.local", "INDEX CACHE");

let redisConnection : Redis | null = null;

export const connectToRedis = () => {
    try {
        if(redisConnection) return redisConnection;
        
        redisConnection = new Redis({
            url:process.env.UPSTASH_REDIS_REST_URL,
            token:process.env.UPSTASH_REDIS_REST_TOKEN 
        });
        return redisConnection;
    } catch (error) {
        console.log(error);
    };
};