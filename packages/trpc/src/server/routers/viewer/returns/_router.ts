import z from "zod";
import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { initiateReturn, getReturnOrders, editReturn, cancelReturn, getAllReturnOrders } from "./return.handler";
import { ZInitiateReturnSchema, ZGetReturnOrdersSchema, ZEditReturnSchema, ZCancelReturnOrderSchema } from "./return.schema";

export const returnRouter = router({
    initiateReturn: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Initiate return order for a user"}})
        .input(ZInitiateReturnSchema)
        .mutation(async ( {ctx, input}) => await initiateReturn({ctx, input}) ),
    getReturnOrders: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Get return orders for a user"}})
        .input(ZGetReturnOrdersSchema)
        .mutation(async ( {ctx, input}) => await getReturnOrders({ctx, input}) ),
    cancelReturn: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit return order"}})
        .input(ZCancelReturnOrderSchema)
        .mutation( async ({ctx, input}) => await cancelReturn({ctx, input}) ),
    editReturn: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel return order"}})
        .input(ZEditReturnSchema)
        .mutation( async ({ctx, input}) => await editReturn({ctx, input}) ),
    getAllReturns: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel return order"}})
        .input(z.object({}))
        .query( async ({ctx, input}) => await getAllReturnOrders({ctx, input}) )
});