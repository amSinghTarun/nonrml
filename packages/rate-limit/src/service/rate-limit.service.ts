import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { connectToRedis } from "../connection/connectRedis";

export const ratelimit = {
    ip: new Ratelimit({
        redis : connectToRedis(),
        limiter: Ratelimit.slidingWindow(10, "300 s"),
        analytics: true,
        prefix: "@nonrml/otpRateLimit/ip"
    }),
    mobileNumber: new Ratelimit({
        redis: connectToRedis(),
        limiter: Ratelimit.slidingWindow(5, "300 s"),
        analytics: true,
        prefix: "@nonrml/otpRateLimit/mobileNumber"
    })
};
