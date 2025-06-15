import { useState } from 'react'
import { RouterInput, trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'

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
  
  return {
    handleStatusChange,
    extendReturnDate,
    handleCancelAcceptedOrder,
    extendDays,
    createDamageReplacement,
    setExtendDays,
    sendOrderAcceptanceMail,
    isActionLoading: editOrderMutation.isLoading
  }
}
