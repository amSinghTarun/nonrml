import { initTRPC } from "@trpc/server";
import { TRPCContext } from "./contexts/context";
import SuperJSON from "superjson"

export const t = initTRPC.context<TRPCContext>().create({
    transformer: SuperJSON
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

