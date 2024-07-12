import { Maybe, TRPCError } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { TRPCContextInner } from "../contexts/context";
import { middleware } from "../trpc";
import { prismaEnums, prismaTypes } from "@nonorml/prisma";
import { getRole } from "@nonorml/rbac";

const checkUserDetails = async ({prisma, session}: TRPCContextInner) => {
    // Verify the user and role etc;
    const user = await prisma.user.findUnique({
        where: {
             id: 1
        },
        include : {
            roles: {
                select: {
                    roleName : true
                }
            }
        }
    });
    return user;
}

const checkExpiry = (session: Maybe<Session>) => {
    //check the expiry;
}

export const checkUserSession = async (ctx: TRPCContextInner) => {
    const session = ctx.session;
    //check jwtimport { CreateNextContextOptions } from "@trpc/server/adapters/next";
    const user = await checkUserDetails(ctx);
    checkExpiry(session);
    return {
        user,
        session
    }
}

export type UserFromSession = Awaited<ReturnType<typeof checkUserDetails>>;

export const sessionMiddleware = middleware( async ({ctx, next}) => {
    const {user, session} = await checkUserSession(ctx); 
    return next({
        ctx: {
            user,
            session
        }
    })
});

export const isAuthed = sessionMiddleware.unstable_pipe( async (opts) => {
    const {ctx, next, meta} = opts;
    if(!ctx.user || !ctx.session ){ // || meta?.role != ctx.user.role add this after you add meta in procedure
        throw new TRPCError({code: "UNAUTHORIZED"});
    }
    return next({ctx : { user : ctx.user}});
})

export const isAdmin = isAuthed.unstable_pipe(({ctx, next}) => {
    const { user } = ctx
    if(ctx.user.roles.roleName !== "ADMIN")
        throw new TRPCError({code: "UNAUTHORIZED", message: "You are not admin"});
    return next({ctx : { user }});
})

export const checkPermission = sessionMiddleware.unstable_pipe(async ({ctx, next}) => {
    const urlObject =  new URL(ctx.req.url!, `http://${ctx.req.headers.host}`);
    const rolePermissions = await getRole(ctx.user?.role!, true);
    if(rolePermissions.permissionNameArray.includes((urlObject.pathname.split("/")[1]!))){
        throw new TRPCError({code: "UNAUTHORIZED", message: "You are not allowed to perform requested action"});
    }
    return next({
        ctx
    });
});

export const isUserAccountActive =  isAuthed.unstable_pipe(({ctx, next}) => {
    if(ctx.user.status != prismaEnums.UserAccountStatus.ACTIVE)
        throw new TRPCError({code: "UNAUTHORIZED", message: "Your account is still in pending state"});
    return next({ctx})
});
