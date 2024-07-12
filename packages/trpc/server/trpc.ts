import { initTRPC } from "@trpc/server";
import { TRPCContext } from "./contexts/context";

interface Meta {
    role: "ADMIN" | "USER" | "ADMIN_APPROVER"
}
const t = initTRPC.context<TRPCContext>().create({
    defaultMeta: {role: "USER"},
    isServer: true,
    allowOutsideOfServer: true,
});
// using meta<Meta>(). creates some kind of error, look into it.

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;     //check what is this middleware