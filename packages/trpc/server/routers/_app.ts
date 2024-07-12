import { router, procedure } from "../trpc";
import { viewerRouter } from "./viewer/_router";
import { publicProtectedProcedure } from "../procedures/authedProcedure";
import { publicProcedure } from "../procedures/publicProcedure";

export const appRouter = router({
    hello: publicProcedure.query( async (opts) => {
        //const user = await prisma.user.findMany();
        console.log(opts);
        const user = [{}]
        return `The number of user are ${user.length}`;
    }),
    // viewer: viewerRouter
});

export type AppRouter = typeof appRouter;