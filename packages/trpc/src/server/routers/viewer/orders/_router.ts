import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { getUserOrder, editOrder, getAllOrders, cancelOrder, getOrderReturnDetails, getOrder, getUserOrders, initiateOrder, verifyOrder, checkOrderServicibility, getTrackOrder, sendOrderConfMail, cancelAcceptedOrder, updateShipmentStatus, shipOrder } from "./orders.handler";
import { ZEditOrderSchema, ZCancelOrderSchema, ZGetOrderSchema, ZGetUserOrderSchema, ZInitiateOrderSchema, ZTrackOrderSchema, ZVerifyOrderSchema, ZGetAllOrdersSchema, ZCheckOrderServicibilitySchema, ZGetOrderReturnSchema, ZCancelAcceptedOrderSchema, ZUpdateShipmentSchema, ZShipOrderrSchema } from "./orders.schema";

export const orderRouter = router({
    sendOrderConfMail: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the orders of a user"}})
        .input(ZGetUserOrderSchema)
        .mutation( async ({ctx, input}) => await sendOrderConfMail({ ctx, input })),
    getUserOrders: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the orders of a user"}})
        .query( async ({ctx}) => await getUserOrders({ ctx })),
    getUserOrder: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular order from the user"}})
        .input(ZGetUserOrderSchema)
        .query( async ({ctx, input}) => await getUserOrder({ctx, input})),
    getOrderReturnDetails: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular order from the user"}})
        .input(ZGetOrderReturnSchema)  // keeping it same as only orderId is needed
        .query( async ({ctx, input}) => await getOrderReturnDetails({ctx, input})),
    trackOrder: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the trackign detail of an order"}})
        .input(ZTrackOrderSchema)
        .query( async ({ctx, input}) =>  await getTrackOrder({ctx, input}) ),
    initiateOrder: publicProcedure 
        .meta({ openAPI: {method: "POST", descrription: "Initiate a new order"}})
        .input(ZInitiateOrderSchema)
        .mutation( async ({ctx, input}) => await initiateOrder({ctx, input}) ),
    verifyOrder: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Verify the order"}})
        .input(ZVerifyOrderSchema)
        .mutation( async ({ctx, input}) => await verifyOrder({ctx, input})),
    cancelOrder: publicProtectedProcedure 
        .meta({ openAPI: {method: "POST", descrription: "Cancel an order"}})
        .input(ZCancelOrderSchema)
        .mutation( async ({ctx, input}) => await cancelOrder({ctx, input}) ),
    getAllOrders: adminProcedure
        .meta({openAPI: {method: "GET", description: "Get all the orders for admin"}})
        .input(ZGetAllOrdersSchema)
        .query(async ({ctx, input}) => await getAllOrders({ctx, input})),
    getOrder: adminProcedure
        .meta({openAPI: {method: "GET", description: "Get all the orders for admin"}})
        .input(ZGetOrderSchema)
        .query(async ({ctx, input}) => await getOrder({ctx, input})),
    editOrder: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZEditOrderSchema)
        .mutation( async ({ctx, input}) => await editOrder({ctx, input}) ),        
    updateUserDetailAndCheckServicibility: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZCheckOrderServicibilitySchema)
        .mutation( async ({ctx, input}) => await checkOrderServicibility({ctx, input}) ),
    cancelAcceptedOrder: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZCancelAcceptedOrderSchema)
        .mutation( async ({ctx, input}) => await cancelAcceptedOrder({ctx, input}) ),
    shipOrder: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZShipOrderrSchema)
        .mutation( async ({ctx, input}) => await shipOrder({ctx, input}) ),
    updateShipmentStatus: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Depends on the razorpay integration"}})
        .input(ZUpdateShipmentSchema)
        .mutation( async ({ctx, input}) => await updateShipmentStatus({ctx, input}) ),      
})