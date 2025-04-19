/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useState, useRef } from 'react'
import { trpc } from '@/app/_trpc/client'

export interface UpdateRejectedRef {
  [productSku: string]: {
    rejectedQuantity: number
    reimbursed: boolean
  }
}

export function useOrderRejection(order: any, onSuccess: () => void) {
  const [isReimbursementPending, setIsReimbursementPending] = useState(false)
  const updateRejected = useRef<UpdateRejectedRef>({})
  
  // Check if any products have rejected quantity greater than reimbursed quantity
  React.useEffect(() => {
    if (!order?.orderProducts) return
    
    const hasPendingReimbursement = order.orderProducts.some(
      (product: any) => (product.reimbursedQuantity || 0) < (product.rejectedQuantity || 0)
    )
    
    setIsReimbursementPending(hasPendingReimbursement)
  }, [order])
  
  const refundMutation = trpc.viewer.payment.initiateUavailibiltyRefund.useMutation({
    onSuccess
  })
  
  const editOrderMutation = trpc.viewer.orders.editOrder.useMutation({
    onSuccess: () => {
      setIsReimbursementPending(false)
      onSuccess()
    }
  })
  
  const handleOrderProductRejection = async () => {
    await editOrderMutation.mutateAsync({
      orderId: order.id,
      productRejectStatus: updateRejected.current
    })
    // Reset after successful update
    updateRejected.current = {}
  }
  
  const initiateRefund = async (orderId: string) => {
    await refundMutation.mutateAsync({ orderId })
  }
  
  const updateRejectedQuantity = (productId: string, quantity: number) => {
    updateRejected.current = {
      ...updateRejected.current,
      [productId]: {
        ...updateRejected.current[productId],
        rejectedQuantity: quantity
      }
    }
  }
  
  return {
    isReimbursementPending,
    isRefundLoading: refundMutation.isLoading,
    isUpdateLoading: editOrderMutation.isLoading,
    handleOrderProductRejection,
    initiateRefund,
    updateRejectedQuantity
  }
}
