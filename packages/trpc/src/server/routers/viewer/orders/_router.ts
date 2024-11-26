import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { cancelOrderProduct, editOrder, getUserOrder, getUserOrders, initiateOrder, verifyOrder } from "./orders.handler";
import { ZcancelOrderProductSchema, ZEditOrderSchema, ZGetUserOrderSchema, ZInitiateOrderSchema, ZTrackOrderSchema, ZVerifyOrderSchema } from "./orders.schema";

export const orderRouter = router({
    getUserOrders: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the orders of a user"}})
        .query( async ({ctx}) => await getUserOrders({ ctx })),
    getUserOrder: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular order from the user"}})
        .input(ZGetUserOrderSchema)
        .query( async ({ctx, input}) => await getUserOrder({ctx, input})),
    trackOrder: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the trackign detail of an order"}})
        .input(ZTrackOrderSchema)
        .query( async ({ctx, input}) =>  await getUserOrder({ctx, input}) ),
    initiateOrder: publicProtectedProcedure 
        .meta({ openAPI: {method: "POST", descrription: "Initiate a new order"}})
        .input(ZInitiateOrderSchema)
        .mutation( async ({ctx, input}) => await initiateOrder({ctx, input}) ),
    verifyOrder: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Verify the order"}})
        .input(ZVerifyOrderSchema)
        .mutation( async ({ctx, input}) => await verifyOrder({ctx, input})),
    // editOrder: orderProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
    //     .input(ZEditOrderSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await editOrder({ctx, input});
    // }),
    // cancelOrderProduct: orderProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
    //     .input(ZcancelOrderProductSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await cancelOrderProduct({ctx, input});
    // }),
})