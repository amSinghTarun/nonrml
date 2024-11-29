// import { rateLimit } from 'express-rate-limit'
// import { TRPCError } from "@trpc/server";
// import { middleware } from "../trpc";
// import { TRPCContext } from "../contexts";

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
// 	limit: 100,
// 	standardHeaders: true,
// 	legacyHeaders: false,
// });

// export const rateLimitLoginMiddleware = middleware( async ({ctx, next}) => {
//     if( !ctx.req || !ctx.res )
//         throw new TRPCError({code: "UNAUTHORIZED", message: "Try after sometime"});
// 	const rateLimited = await limiter(ctx.req, ctx.res);
// 	console.log(rateLimited)
// 	return next();
// });