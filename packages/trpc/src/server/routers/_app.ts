import { router } from "../trpc";
import { viewerRouter } from "./viewer/_router";
import { publicProcedure } from "../procedures/publicProcedure";
import { z } from "zod";

export const appRouter = router({
    viewer: viewerRouter,
    testAPI: publicProcedure.input(z.object({name: z.string()})).mutation(({ctx, input}) => {
        //console.log(input)
        return {input: {
            yourInput: input ?? ["default output"]
        }};
    }) 
});

export type AppRouter = typeof appRouter;