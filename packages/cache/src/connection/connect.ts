import "dotenv/config"
import { Redis } from "@upstash/redis"

let redisConnection : any = null;

export const connectToRedis = async () => {
    try {
        if(redisConnection)
            return redisConnection;
        redisConnection = new Redis({
            url: "https://normal-ibex-53880.upstash.io",
            token: "AdJ4AAIjcDFkZjdhOTllZjE5YWY0NGUwODgxZDI4M2FlMTRmZjEzY3AxMA",
          });
        return redisConnection;
    } catch (error) {
        //console.log(error)
    }
};