"use client"

import { RouterOutput, trpc } from "@/app/_trpc/client"
import { serverClient } from "@/app/_trpc/serverClient"
import { changePaymentStatus, verifyRzpOrder } from "@/app/actions/payment.action"
import { createRzpConfig } from "@nonrml/payment"
import { redirect } from "next/navigation"
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
    
export const displayRazorpay = async ({rzpOrder}: {rzpOrder: rzpOrder}) => {

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
    if (!res){
        alert('Razropay failed to load!!')
        return 
    }
    //console.log(rzpOrder)
    const options = createRzpConfig(rzpOrder, async (response) => {
      const raizorpayPaymentIad = response.razorpay_payment_id;
      const raizorpayOrderId = response.razorpay_order_id;
      const raizorpaySignature = response.razorpay_signature;
      await verifyRzpOrder({razorpayPaymentId: raizorpayPaymentIad, razorpayOrderId: raizorpayOrderId, razorpaySignature: raizorpaySignature})
    });
    const paymentObject = new window.Razorpay(options); 
    paymentObject.on('payment.failed', (response: any) => {
        changePaymentStatus({orderId: response.error.metadata.order_id, paymentStatus: 'failed'})
    });
    paymentObject.open();
}
