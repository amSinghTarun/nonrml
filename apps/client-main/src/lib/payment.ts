"use client"

import { RouterOutput } from "@/app/_trpc/client"
import { changePaymentStatus, verifyRzpOrder } from "@/app/actions/payment.action"
import { createRzpConfig } from "@nonrml/payment"
import { useCartItemStore } from "@/store/atoms"

type rzpOrder = RouterOutput["viewer"]["orders"]["initiateOrder"]["data"]

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }
    document.body.appendChild(script)
  })
}
    
export const displayRazorpay = async ({rzpOrder, cartOrder, onDismissHandler}: {rzpOrder: rzpOrder, cartOrder: boolean, onDismissHandler: () => void}) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res){
        alert('Razropay failed to load!!')
        return 
    }

    const options = createRzpConfig({
      rzpOrder: rzpOrder, 
      callbckHandler: async (response) => {
        if(cartOrder){
          useCartItemStore.getState().reset();
        }
        const raizorpayPaymentIad = response.razorpay_payment_id;
        const raizorpayOrderId = response.razorpay_order_id;
        const raizorpaySignature = response.razorpay_signature;
        await verifyRzpOrder({razorpayPaymentId: raizorpayPaymentIad, razorpayOrderId: raizorpayOrderId, razorpaySignature: raizorpaySignature})
      },
      onDismissHandler: onDismissHandler
    });
    const paymentObject = new (window as any).Razorpay(options); 
    paymentObject.on('payment.failed', (response: any) => {
        changePaymentStatus({orderId: response.error.metadata.order_id, paymentStatus: 'failed'})
    });
    paymentObject.open();
}