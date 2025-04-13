import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { ratelimit } from "@nonrml/rate-limit"

export const rateLimitLoginMiddleware = middleware( async ({ctx, input, next}) => {
    try{
        if( !ctx.req ) {
            throw new TRPCError({code: "UNAUTHORIZED", message: "Try after sometime"})
        }
        
        let contact = typeof input === 'object' && input && 'contactNumber' in input ? input.contactNumber : ctx.user?.contactNumber;

        if (!contact) {
            throw new TRPCError({code: "BAD_REQUEST", message: "Contact number is required"})
        }

        const rateLimitedIP = await ratelimit.ip.limit(`${ctx.req.headers.get("x-forwarded-for")}`);
        const rateLimitedMobileNumber = await ratelimit.mobileNumber.limit(`${contact}`);
        if( !rateLimitedIP.success || !rateLimitedMobileNumber.success)
            throw new Error("Too many request, try after sometime")
        return next();
    } catch(error){
        throw error
    }
});