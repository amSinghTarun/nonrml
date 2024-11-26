import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { initiateReturn, getReturnOrders } from "./return.handler";
import { ZInitiateReturnSchema, ZGetReturnOrdersSchema } from "./return.schema";

export const returnRouter = router({
    initiateReturn: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Initiate return order for a user"}})
        .input(ZInitiateReturnSchema)
        .mutation(async ( {ctx, input}) => await initiateReturn({ctx, input}) ),
    getReturnOrders: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Get return orders for a user"}})
        .input(ZGetReturnOrdersSchema)
        .mutation(async ( {ctx, input}) => await getReturnOrders({ctx, input}) ),
    // editReturn: adminProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Edit return order"}})
    //     .input(ZEditReturnSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await editReturn({ctx, input});
    // }),
    // deleteReturn: procedure
    //     .meta({ openAPI: {method: "POST", descrription: "cancel return order"}})
    //     .input(ZDeleteReturnSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await deleteReturn({ctx, input});
    // })
});