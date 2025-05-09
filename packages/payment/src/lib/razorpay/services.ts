import RzpInstance from "./connection";
import { Orders } from "razorpay/dist/types/orders";
import { Refunds } from "razorpay/dist/types/refunds";

export const createOrder = async (input: Orders.RazorpayOrderCreateRequestBody) => {
    return await RzpInstance().orders.create(input)
}

export const initiateNormalRefund = async (paymentId: string, input: Refunds.RazorpayRefundBaseRequestBody) => {
    return await RzpInstance().payments.refund(paymentId, input);
}

export const getPaymentDetials = async ({rzpPaymentId} : {rzpPaymentId: string}) => (
    await RzpInstance().payments.fetch(rzpPaymentId)
)

export const createRzpConfig = ( {rzpOrder, callbckHandler, onDismissHandler} : {
    rzpOrder: {contact: string, name: string, email: string, amount: number, rzpOrderId: string},
    callbckHandler: (data: any) => void,
    onDismissHandler: () => void
}) => {
    return {
        "key": process.env.RAZORPAY_KEY_ID,
        "amount": rzpOrder.amount*100,
        "currency": "INR",
        "name": "NoNRML",
        "order_id": rzpOrder.rzpOrderId, 
        "handler": callbckHandler,
        prefill: {
            contact: rzpOrder.contact,
            name: rzpOrder.name,
            email: rzpOrder.email,
        },
        "theme": {
            "color": "#000000"
        },
        modal: {
            escape: false,
            handleback:false,
            confirm_case: true,
            onDismiss: onDismissHandler
        }
    };
}

// "callback_url":`http://localhost:3000/api/trpc/viewer.orders.verifyOrder`, //process.env.RAZORPAY_CALLBACK_URL