"use client"

import { RouterInput, RouterOutput, trpc } from "@/app/_trpc/client"
import { createRzpConfig } from "@nonrml/payment"
import { useCartItemStore } from "@/store/atoms"
import { useRouter } from "next/navigation"

type rzpOrder = RouterOutput["viewer"]["orders"]["initiateOrder"]["data"]
type UpdatePaymentStatusInput = RouterInput["viewer"]["payment"]["updateFailedPaymentStatus"]

function loadScript(src: string) {
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
    
export const displayRazorpay = async ({
  rzpOrder, 
  cartOrder, 
  updatePaymentStatus,
  verifyOrder
}: {
  rzpOrder: rzpOrder, 
  cartOrder: boolean, 
  onDismissHandler?: () => void,
  updatePaymentStatus: (data: UpdatePaymentStatusInput ) => void,
  verifyOrder: (data: { 
    razorpayPaymentId: string, 
    razorpayOrderId: string, 
    razorpaySignature: string 
  }) => void
}) => {
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
        verifyOrder({
          razorpayPaymentId: raizorpayPaymentIad, 
          razorpayOrderId: raizorpayOrderId, 
          razorpaySignature: raizorpaySignature
        });
      },
      // onDismissHandler: onDismissHandler
    });
    console.log(options)
    const paymentObject = new (window as any).Razorpay(options); 

    paymentObject.on('payment.failed', (response: any) => {
      updatePaymentStatus({
        orderId: response.error.metadata.order_id, 
        paymentStatus: "failed"
      });
    });

    console.log("almost");
    
    paymentObject.open();
}