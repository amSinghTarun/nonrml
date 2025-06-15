import RzpInstance from "./connection";
import { Orders } from "razorpay/dist/types/orders";
import { Refunds } from "razorpay/dist/types/refunds";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export const createOrder = async (input: Orders.RazorpayOrderCreateRequestBody) => {
    return await RzpInstance().orders.create(input)
}

export const validateRzpWebhook = (rawRequestBody: string, webhookSignature: string) => {
    if(process.env.RZP_WEBHOOK_SECRET)
        return validateWebhookSignature(rawRequestBody, webhookSignature, process.env.RZP_WEBHOOK_SECRET);
    return false;
}

export const initiateNormalRefund = async (paymentId: string, input: Refunds.RazorpayRefundBaseRequestBody) => {
    return await RzpInstance().payments.refund(paymentId, input);
}

export const getPaymentDetials = async ({rzpPaymentId} : {rzpPaymentId: string}) => (
    await RzpInstance().payments.fetch(rzpPaymentId)
)

export const getOrderDetials = async ({rzpOrderId} : {rzpOrderId: string}) => (
    await RzpInstance().orders.fetch(rzpOrderId)
)

export const createRzpConfig = ( {rzpOrder, callbckHandler, onDismissHandler} : {
    rzpOrder: {amount: number, rzpOrderId: string},
    // rzpOrder: {contact: string, name: string, email: string, amount: number, rzpOrderId: string},
    callbckHandler: (data: any) => void,
    onDismissHandler?: () => void
}) => {
    return {
        key: process.env.RAZORPAY_KEY_ID,
        one_click_checkout: true,
        amount: rzpOrder.amount*100,
        currency: "INR",
        name: "NoNRML",
        order_id: rzpOrder.rzpOrderId,
        handler: callbckHandler,
        theme: {
            "color": "#000000"
        },
        modal: {
            escape: false,
            handleback:false,
            confirm_case: true,
            // onDismiss: onDismissHandler
        }
    };
}