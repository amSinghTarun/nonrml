import { router } from "../../../trpc";
import { adminProcedure, publicProtectedProcedure} from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import * as paymentHandler from "./payments.handler";
import * as paymentSchema from "./payments.schema";

export const paymentRouter = router({
    rzpPaymentUpdateWebhook: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create new order"}})
        .input(paymentSchema.ZRzpPaymentUpdateWebhookSchema)
        .mutation( async ({ctx, input}) =>  await paymentHandler.rzpPaymentUpdateWebhook({ctx, input}) ),
    updateFailedPaymentStatus: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Change payment status"}})
        .input(paymentSchema.ZChangePaymentStatusSchema)
        .mutation( async ({ctx, input}) =>  await paymentHandler.updateFailedPaymentStatus({ctx, input})),
    initiateUavailibiltyRefund: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
        .input(paymentSchema.ZInitiateUavailibiltyRefundSchema)
        .mutation( async ({ctx, input}) => await paymentHandler.initiateUavailibiltyRefund({ctx, input}) ),
    getAllPayments: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
        .input(paymentSchema.ZGetPaymentsSchema)
        .query( async ({ctx, input}) => await paymentHandler.getPayments({ctx, input}) ),
    getPaymentRefundDetails: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
        .input(paymentSchema.ZGetPaymentRefundDetailsSchema)
        .query( async ({ctx, input}) => await paymentHandler.getPaymentRefundDetails({ctx, input}) ),
    issueReturnReplacementBankRefund: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "cancel order"}})
        .input(paymentSchema.ZIssueReturnReplacementBankRefundSchema)
        .mutation( async ({ctx, input}) => await paymentHandler.issueReturnReplacementBankRefund({ctx, input}) ),
});