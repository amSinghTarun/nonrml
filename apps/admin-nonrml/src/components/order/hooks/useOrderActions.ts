import { useState } from 'react'
import { RouterInput, trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'
import { ShiprocketShipping, ShiprocketTypes } from '@nonrml/shipping';

export function useOrderActions(orderId: number | undefined, onSuccess: () => void) {
  const [extendDays, setExtendDays] = useState<number>(0)
  
  const editOrderMutation = trpc.viewer.orders.editOrder.useMutation({
    onSuccess
  })

  const cancelAcceptedOrderMutation = trpc.viewer.orders.cancelAcceptedOrder.useMutation({
    onSuccess
  });

  const handleCancelAcceptedOrder = async (refundMode: "CREDIT"|"BANK") => {
    if(!orderId)
      return
    await cancelAcceptedOrderMutation.mutateAsync({
      orderId: orderId,
      refundMode: refundMode
    })
  }
  
  const sendOrderAcceptanceMailMutation = trpc.viewer.orders.sendOrderConfMail.useMutation({
    onSuccess
  })


  const sendOrderAcceptanceMail = async (orderId: string) => {
    if (!orderId) return
    
    await sendOrderAcceptanceMailMutation.mutateAsync({
      orderId
    })
  }

  const handleStatusChange = async (newStatus: prismaTypes.OrderStatus) => {
    if (!orderId) return
    
    await editOrderMutation.mutateAsync({
      orderId,
      status: newStatus
    })
  }

  const initiateDamageProductReplacement = trpc.viewer.return.initiateReturn.useMutation();
  const createDamageReplacement = async ({orderId, returnType, products}: RouterInput["viewer"]["return"]["initiateReturn"] ) => {
    await initiateDamageProductReplacement.mutateAsync({ orderId: orderId, returnType: returnType, products: products })
  };
  
  const extendReturnDate = async (days: number, initialReturnDate: number) => {
    if (!orderId || days <= 0) return
    
    await editOrderMutation.mutateAsync({
      orderId,
      returnDateExtend: days,
      initialReturnDate
    })
  }

  const shipOrder = async (shippingDetails : ShiprocketTypes.OrderData) => {
    if (!orderId) return

    const shipOrderDetails = trpc.viewer.orders.shipOrder.useMutation();

    const orderShipped = await shipOrderDetails.mutateAsync({
      orderId,
      shiprocketOrderData: shippingDetails
    }, {
      onSuccess: () => {
        onSuccess()
      }
    })

    return orderShipped
  }
  
  return {
    handleStatusChange,
    extendReturnDate,
    handleCancelAcceptedOrder,
    extendDays,
    shipOrder,
    createDamageReplacement,
    setExtendDays,
    sendOrderAcceptanceMail,
    isActionLoading: editOrderMutation.isLoading
  }
}
