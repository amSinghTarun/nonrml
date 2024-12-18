import dotenv from "dotenv"
import { Redis } from "@upstash/redis"
import path from "path";

dotenv.config({path: path.resolve("../../packages/cache/.env")})

let redisConnection : any = null;

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