// "use server"

// import { serverClient } from "../_trpc/serverClient"

// export const verifyRzpOrder = async ({razorpayPaymentId, razorpayOrderId, razorpaySignature}: {razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string}) => {
//     // const session = await getSession();
//     // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
//     const response = await (await serverClient()).viewer.orders.verifyOrder({razorpayPaymentId, razorpayOrderId, razorpaySignature})
//     if(response.status == "SUCCESS" && response.data.orderId) {
//         console.log("SUCCESSFULL")
        
//     }
//     return response;

// };

// export const changePaymentStatus = async ({orderId, paymentStatus}: {orderId: string, paymentStatus: 'failed'|'captured'}) => {
//     // const session = await getSession();
//     // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
//     const { data } = await (await serverClient()).viewer.payment.updateFailedPaymentStatus({orderId, paymentStatus})
//     return data;
// };