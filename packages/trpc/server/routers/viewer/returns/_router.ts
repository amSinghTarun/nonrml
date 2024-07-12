import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { deleteReturn, editReturn, initiateReturn } from "./return.handler";
import { ZDeleteReturnSchema, ZEditReturnSchema, ZInitiateReturnSchema } from "./return.schema";

export const returnRouter = router({
    initiateReturn: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Initiate return order for a user"}})
        .input(ZInitiateReturnSchema)
        .mutation(async ({ctx, input}) => {
        return await initiateReturn({ctx, input});
    }),
    editReturn: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit return order"}})
        .input(ZEditReturnSchema)
        .mutation( async ({ctx, input}) => {
        return await editReturn({ctx, input});
    }),
    deleteReturn: procedure
        .meta({ openAPI: {method: "POST", descrription: "cancel return order"}})
        .input(ZDeleteReturnSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteReturn({ctx, input});
    })
});