import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { getReplacementOrders, initiateReplacementOrder } from "./replacement.handler";
import { ZGetReplacementOrderSchema, ZInitiateReplacementOrderSchema } from "./replacement.schema";

export const replacementRouter = router({
    getReplacement : publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get replaement orders for an user"}})
        .input(ZGetReplacementOrderSchema)
        .query( async ({ctx, input}) => await getReplacementOrders({ctx, input}) ),
    initiateReplacement : publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Initiate replacement order for a user"}})
        .input(ZInitiateReplacementOrderSchema)
        .mutation(async ({ctx, input}) => {
        return await initiateReplacementOrder({ctx, input});
    }),
    // editReplacementOrder: procedure
    //     .meta({ openAPI: {method: "POST", descrription: "Edit replacement order"}})
    //     .input(ZEditReplacementOrderSchema)
    //     .mutation(async ({ctx, input}) => {
    //     return await editReplacementOrder({ctx, input});
    // }),
});


