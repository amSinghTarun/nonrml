import { createClient } from 'redis';

export const client = createClient({
    url: 'redis://alice:foobared@awesome.redis.server:6380',
    socket : {
        reconnectStrategy : (retries, _cause) => {
            if(retries > 20) {
                return new Error("Too many retires;");
            }
            return retries * 50
        }
    }
});

let redisConnection : any = null;

export const connectToRedis = async () => {
    try {
        if(redisConnection)
            return redisConnection;
        redisConnection = await client.connect();
    } catch {
        client.on('error', (err: any) => console.log('Redis Client Error', err));
    }
};