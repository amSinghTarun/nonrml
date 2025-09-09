import { useState } from 'react'
import { RouterInput, trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'
import { ShiprocketTypes } from '@nonrml/shipping';
import { TRPCResponseStatus } from '@nonrml/common';

export function useOrderActions(orderId: number | undefined, onSuccess: () => void) {
  const [extendDays, setExtendDays] = useState<number>(0)
  
  const editOrderMutation = trpc.viewer.orders.editOrder.useMutation({
    onSuccess
  })
  const cancelAcceptedOrderMutation = trpc.viewer.orders.cancelAcceptedOrder.useMutation({
    onSuccess
  });
  const initiateDamageProductReplacement = trpc.viewer.return.initiateReturn.useMutation({
    onSuccess
  });
  const sendOrderAcceptanceMailMutation = trpc.viewer.orders.sendOrderConfMail.useMutation({
    onSuccess
  })
  const shipOrderDetails = trpc.viewer.orders.shipOrder.useMutation({
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
    if (!orderId) return { status: TRPCResponseStatus.SUCCESS, message:"Shipped Successfully", data: ""}
    const orderShipped = await shipOrderDetails.mutateAsync({
      orderId,
      shiprocketOrderData: shippingDetails
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
