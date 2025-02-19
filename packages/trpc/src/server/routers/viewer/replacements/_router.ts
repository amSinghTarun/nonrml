import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { finaliseReturnAndMarkReplacementOrder, updateNonReplaceQuantity, getReplacementOrders } from "./replacement.handler";
import { ZInitReplacementOrderSchema, ZUpdateNonReplaceQuantitySchema, ZGetReplacementOrderSchema } from "./replacement.schema";

export const replacementRouter = router({
    getReplacement : publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get replaement orders for an user"}})
        .input(ZGetReplacementOrderSchema)
        .query( async ({ctx, input}) => await getReplacementOrders({ctx, input}) ),
    finaliseReturnAndMarkReplacementOrder: procedure
        .meta({ openAPI: {method: "POST", descrription: "Edit replacement order"}})
        .input(ZInitReplacementOrderSchema)
        .mutation(async ({ctx, input}) => await finaliseReturnAndMarkReplacementOrder({ctx, input}) ),
    updateNonReplaceQuantity: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit replacement order"}})
        .input(ZUpdateNonReplaceQuantitySchema)
        .mutation(async ({ctx, input}) => await updateNonReplaceQuantity({ctx, input}))
});


