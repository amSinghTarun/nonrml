import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { ratelimitWithIP, ratelimitWithMobileNumber } from "@nonrml/rate-limit"

export const rateLimitLoginMiddleware = middleware( async ({ctx, input, next}) => {
    try{
        console.log("Entered the rateLimitLoginMiddleware ")
        if( !ctx.req ) {
            throw new TRPCError({code: "UNAUTHORIZED", message: "Try after sometime"})
        }
        
        let contact = typeof input === 'object' && input && 'contactNumber' in input ? input.contactNumber : ctx.user?.contactNumber;

        if (!contact) {
            throw new TRPCError({code: "BAD_REQUEST", message: "Contact number is required"})
        }

        const rateLimitedIP = await ratelimitWithIP().limit(`${ctx.req.headers.get("x-forwarded-for")}`);
        const rateLimitedMobileNumber = await ratelimitWithMobileNumber().limit(`${contact}`);
        if( !rateLimitedIP.success || !rateLimitedMobileNumber.success)
            throw new Error("Too many request, try after sometime")

        console.log("Exited the rateLimitLoginMiddleware ")

        return next();
    } catch(error){
        throw error
    }
});