import { Redis } from "@upstash/redis";
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/rate-limit/.env.local", "RATE-LIMIT");

let redisConnection : any = null;

export const connectToRedis = () => {
    try {
        if(redisConnection)
            return redisConnection;
        
        redisConnection = new Redis({
            url:process.env.UPSTASH_REDIS_REST_URL,
            token:process.env.UPSTASH_REDIS_REST_TOKEN 
        });
        return redisConnection;
    } catch (error) {
        console.log(error);
    };
};