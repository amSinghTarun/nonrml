import { orderProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { cancelOrderProduct, editOrder, getUserOrder, getUserOrders, initiateOrder } from "./orders.handler";
import { ZcancelOrderProductSchema, ZEditOrderSchema, ZGetUserOrderSchema, ZInitiateOrderSchema } from "./orders.schema";

export const orderRouter = router({
    getUserOrders: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the orders of a user"}})
        .query( async ({ctx, input}) => {
            return await getUserOrders({ctx, input});
        }),
    getUserOrder: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular order from the user"}})
        .input(ZGetUserOrderSchema)
        .query( async ({ctx, input}) => {
        return await getUserOrder({ctx, input});
    }),
    initiateOrder: orderProcedure 
        .meta({ openAPI: {method: "POST", descrription: "Initiate a new order"}})
        .input(ZInitiateOrderSchema)
        .mutation(async ({ctx, input}) => {
        return await initiateOrder({ctx, input});
    }),
    editOrder: orderProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZEditOrderSchema)
        .mutation( async ({ctx, input}) => {
        return await editOrder({ctx, input});
    }),
    cancelOrderProduct: orderProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
        .input(ZcancelOrderProductSchema)
        .mutation( async ({ctx, input}) => {
        return await cancelOrderProduct({ctx, input});
    }),
})