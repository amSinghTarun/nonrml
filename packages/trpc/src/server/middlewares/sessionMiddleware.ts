import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";
import { TRPCContext } from "../contexts";

export const checkSessionUser = async (ctx: TRPCContext) => {
    const user = await ctx.prisma.user.findUnique({
        where: {
            id: Number(ctx.session!.user.id)
        }
    });
    return {
        user
    }
}

export const sessionMiddleware = middleware( async ({ctx, next}) => {
    //console.log("Request Start------------------------------------------")
    //console.log(ctx.req?.headers.get("x-forwarded-for"), "\n", ctx.req?.headers)
    //console.log("-------------------------------------------------------")
    if( !ctx.session )
        throw new TRPCError({code: "UNAUTHORIZED", message: "You must login to use this route"});
    const { user } = await checkSessionUser(ctx); 
    if( !user )
        throw new TRPCError({code: "UNAUTHORIZED", message: "Invalid User, please clear cookies and try again"});
    return next({
        ctx: {
            user
        }
    })
});

export const isAuthed = sessionMiddleware.unstable_pipe( async (opts) => {
    const {ctx, next, meta} = opts;
    return next({ctx : { user : ctx.user}});
})

export const isAdmin = isAuthed.unstable_pipe(({ctx, next}) => {
    const { user } = ctx
    if(user.role !== "ADMIN")
        throw new TRPCError({code: "UNAUTHORIZED", message: "You are not admin"});;
    return next({ctx : { user }});
})

// export const checkPermission = sessionMiddleware.unstable_pipe(async ({ctx, next}) => {
//     const urlObject =  new URL(ctx.req.url!, `http://${ctx.req.headers.host}`);
//     const rolePermissions = await getRole(ctx.user?.role!, true);
//     if(rolePermissions.permissionNameArray.includes((urlObject.pathname.split("/")[1]!))){
//         throw new TRPCError({code: "UNAUTHORIZED", message: "You are not allowed to perform requested action"});
//     }
//     return next({
//         ctx
//     });
// });

// export const isUserAccountActive =  isAuthed.unstable_pipe(({ctx, next}) => {
//     if(ctx.user.status != prismaEnums.UserAccountStatus.ACTIVE)
//         throw new TRPCError({code: "UNAUTHORIZED", message: "Your account is still in pending state"});
//     return next({ctx})
// });