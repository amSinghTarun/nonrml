import Instance from "./connection";
import { Orders } from "razorpay/dist/types/orders";

export const createOrder = async (input: Orders.RazorpayOrderCreateRequestBody) => {
    return await Instance.orders.create(input)
}

export const createRzpConfig = (
    rzpOrder: {contact: string, name: string, email: string, amount: number, rzpOrderId: string},
    callbckHandler : (data: any) => void
) => {
    return {
        "key": "rzp_test_dpM31kdWN8H58H", // process.env.RAZORPAY_KEY_ID
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
        }
    };
}
// "callback_url":`http://localhost:3000/api/trpc/viewer.orders.verifyOrder`, //process.env.RAZORPAY_CALLBACK_URL