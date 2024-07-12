import { prisma } from "@nonorml/prisma";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Session, getServerSession } from "next-auth";
import { config } from "@nonorml/configs";
import { getRoles } from "@nonorml/rbac";
import { PermissionRoleMapType } from "@nonorml/rbac";

interface CreateInnerContextOptions extends Partial<CreateNextContextOptions> {
    session : Session | null;
}

export const createContextInner = async (opts: CreateInnerContextOptions) => {
    return {
        session: opts?.session,
        prisma,
    }
}

// NOTE: you have to import the context in the handler function
// Using only inner context is not fissible, as you can't use it the apiHandler as it's meant for
// internal use, it lacks the req and res object so you have to wrap the internal context in 
// normal context to use it in the handler.
export const createContext = async (opts: CreateNextContextOptions) => {
    const session = await getServerSession(opts?.req, opts?.res, config);
    const contextInner = await createContextInner({ session });
    return {
      ...contextInner,
      req: opts.req,
      res: opts.res,
    };
}

export type TRPCContext = Awaited<ReturnType<typeof createContext>>
export type TRPCContextInner = Awaited<ReturnType<typeof createContextInner>>;