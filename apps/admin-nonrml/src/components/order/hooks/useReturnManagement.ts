import { useState } from 'react'
import { trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'

interface ReturnReview {
  [returnItemId: string]: {
    rejectedQuantity: number
    rejectReason: string
  }
}

export function useReturnManagement() {
  const [returnReviews, setReturnReviews] = useState<ReturnReview>({})
  const [nonReplaceQuantity, setNonReplaceQuantity] = useState<number>(0)
  
  const utils = trpc.useUtils()
  
  const cancelReturnMutation = trpc.viewer.return.cancelReturn.useMutation({
    onSuccess: () => {
      utils.viewer.orders.getOrder.invalidate()
    }
  })

  const shipOrderDetails = trpc.viewer.orders.shipOrder.useMutation();
  
  const updateReturnMutation = trpc.viewer.return.editReturn.useMutation({
    onSuccess: () => {
      utils.viewer.orders.getOrder.invalidate()
    }
  })
  
  const finaliseReplacementMutation = trpc.viewer.replacement.finaliseReturnAndMarkReplacementOrder.useMutation({
    onSuccess: () => {
      utils.viewer.orders.getOrder.invalidate()
    }
  })
  
  const updateNonReplaceQuantityMutation = trpc.viewer.replacement.updateNonReplaceQuantity.useMutation()
  
  const createCreditNoteMutation = trpc.viewer.creditNotes.createCreditNote.useMutation()
  const initiateBankRefundMutation = trpc.viewer.payment.issueReturnReplacementBankRefund.useMutation()
  
  const editReplacementOrderMutation = trpc.viewer.replacement.editReplacementOrder.useMutation()
  
  const handleReturnReviewChange = (returnItemId: number, field: 'rejectedQuantity' | 'rejectReason', value: string | number) => {
    setReturnReviews(prev => ({
      ...prev,
      [returnItemId]: {
        ...prev[returnItemId],
        [field]: value
      }
    }))
  }
  
  const handleReturnStatusChange = async (returnId: number, status: prismaTypes.ReturnStatus) => {
    await updateReturnMutation.mutateAsync({
      returnId,
      returnStatus: status
    })
  }
  
  const handleReturnReviewSubmit = async (returnId: number) => {
    await updateReturnMutation.mutateAsync({
      returnId,
      returnStatus: "ASSESSED",
      reviewData: returnReviews
    })
  }
  
  const handleReplacementReviewSubmit = async (replacementOrderId: number) => {
    await finaliseReplacementMutation.mutateAsync({
      replacementOrderId,
      reviewData: returnReviews
    })
  }
  
  const handleCancelReturn = async (returnOrderId: number) => {
    await cancelReturnMutation.mutateAsync({ returnOrderId })
  }
  
  const handleNonReplace = async (replacementOrderProductId: number, quantity: number) => {
    await updateNonReplaceQuantityMutation.mutateAsync({
      replacementOrderProductId,
      nonReplacementQuantity: quantity
    })
  }
  
  const handleCreateCreditNote = async (replacementOrderId: number, extraAmount: number) => {
    await createCreditNoteMutation.mutateAsync({ replacementOrderId, extraAmount })
  }

  const handleInitiateBankRefund = async ( replacementOrderId: number ) => {
    await initiateBankRefundMutation.mutateAsync({ replacementOrderId })
  }
  
  const handleReplacementOrderStatusChange = async (replacementId: number, status: prismaTypes.ReplacementOrderStatus) => {
    await editReplacementOrderMutation.mutateAsync({
      replacementId,
      replacementStatus: status
    })
  }
  
  return {
    returnReviews,
    nonReplaceQuantity,
    setNonReplaceQuantity,
    isCancelLoading: cancelReturnMutation.isLoading,
    isUpdateLoading: updateReturnMutation.isLoading,
    isFinaliseLoading: finaliseReplacementMutation.isLoading,
    isNonReplaceLoading: updateNonReplaceQuantityMutation.isLoading,
    isCreditNoteLoading: createCreditNoteMutation.isLoading,
    isStatusChangeLoading: editReplacementOrderMutation.isLoading,
    handleReturnReviewChange,
    handleReturnStatusChange,
    handleReturnReviewSubmit,
    handleInitiateBankRefund,
    handleReplacementReviewSubmit,
    handleCancelReturn,
    handleNonReplace,
    handleCreateCreditNote,
    handleReplacementOrderStatusChange
  }
}