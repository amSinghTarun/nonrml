import { Redis } from "@upstash/redis"
import { loadEnv } from "@nonrml/common";

loadEnv("../../packages/cache/.env", "INDEX CACHE");

let redisConnection : Redis | null = null;

export const connectToRedis = () => {
    try {
        if(redisConnection) return redisConnection;
       console.log("it's getting called", process.cwd(), process.env)
        redisConnection = new Redis({
            url:process.env.UPSTASH_REDIS_REST_URL,
            token:process.env.UPSTASH_REDIS_REST_TOKEN 
        });
        return redisConnection;
    } catch (error) {
        console.log(error);
    };
};