import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { connectToRedis } from "../connection/connectRedis";

export const ratelimitWithIP = () => {
    return new Ratelimit({
        redis : connectToRedis(),
        limiter: Ratelimit.slidingWindow(10, "300 s"),
        analytics: true,
        prefix: "@nonrml/otpRateLimit/ip"
    })
}
export const ratelimitWithMobileNumber = () => {
    return new Ratelimit({
        redis: connectToRedis(),
        limiter: Ratelimit.slidingWindow(5, "300 s"),
        analytics: true,
        prefix: "@nonrml/otpRateLimit/mobileNumber"
    })
};
