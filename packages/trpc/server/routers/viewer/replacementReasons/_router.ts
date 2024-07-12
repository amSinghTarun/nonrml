import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { addReplacementReasons, deleteReplacementReasons, editReplacementReasons, getReplacementReasons } from "./replacementReasons.handler";
import { ZAddReplacementReasonsSchema, ZDeleteRepalcementReasonsSchema, ZEditRepalcementReasonsSchema } from "./replacementReasons.schema";

export const replacementReasonRouter = router({
    getReplacementReason: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get replacement reasons"}})
        .query(async (ctx:{}) => {
        return await getReplacementReasons(ctx);
    }),
    addReplacementReasons: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new replacement reasons"}})
        .input(ZAddReplacementReasonsSchema)
        .mutation( async ({ctx, input}) => {
        return await addReplacementReasons({ctx, input});
    }),
    editReplacementReasons: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit replacement reasons"}})
        .input(ZEditRepalcementReasonsSchema)
        .mutation(async ({ctx, input}) => {
        return await editReplacementReasons({ctx, input});
    }),
    deleteReplacementReasons: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete replacement reasons"}})
        .input(ZDeleteRepalcementReasonsSchema)
        .mutation(async ({ctx, input}) => {
        return await deleteReplacementReasons({ctx, input});
    })
})