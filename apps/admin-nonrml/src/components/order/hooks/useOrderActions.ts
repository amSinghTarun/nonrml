import { useState } from 'react'
import { trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'

export function useOrderActions(orderId: string | undefined, onSuccess: () => void) {
  const [extendDays, setExtendDays] = useState<number>(0)
  
  const editOrderMutation = trpc.viewer.orders.editOrder.useMutation({
    onSuccess
  })
  
  const handleStatusChange = async (newStatus: prismaTypes.OrderStatus) => {
    if (!orderId) return
    
    await editOrderMutation.mutateAsync({
      orderId,
      status: newStatus
    })
  }
  
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
    extendDays,
    setExtendDays,
    isActionLoading: editOrderMutation.isLoading
  }
}
