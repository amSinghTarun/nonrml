import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { ratelimit } from "@nonrml/rate-limit"

export const rateLimitLoginMiddleware = middleware( async ({ctx, input, next}) => {
    if( !ctx.req )
        throw new TRPCError({code: "UNAUTHORIZED", message: "Try after sometime"})
	const rateLimitedIP = await ratelimit.ip.limit(`${ctx.req.headers.get("x-forwarded-for")}`);
	const rateLimitedMobileNumber = await ratelimit.mobileNumber.limit(`${input.contactNumber}`);
    if( !rateLimitedIP.success || !rateLimitedMobileNumber.success)
        throw new Error("Too many request, try after sometime")
	return next();
});