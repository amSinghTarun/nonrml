import { initTRPC } from "@trpc/server";
import { createContext, TRPCContext } from "./contexts/context";
import { appRouter } from "./routers";
import SuperJSON from "superjson";
import { session } from "@nonrml/configs";
// import SuperJSON from "superjson";

export const t = initTRPC.context<TRPCContext>().create({
    //un comment this to use http
    transformer: SuperJSON
});
// using meta<Meta>(). creates some kind of error, look into it.

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;     //check what is this middleware
export const createServerCaller = (session:session|null) => t.createCallerFactory(appRouter)(createContext({session: session}))

