"use client"

import React from 'react'
import { RouterOutput, trpc } from '@/app/_trpc/client'
import { useOrderActions } from './hooks/useOrderActions'
import { useOrderRejection } from './hooks/useOrderRejection'
import OrderDetailsHeader from './OrderDetailsHeader'
import ShippingDetails from './ShippingDetails'
import OrderActionsPanel from './OrderActionsPanel'
import OrderItemsTable from './OrderItemsTable'
import ReturnsAndReplacements from './ReturnsAndReplacements'
import { UseTRPCQueryResult } from '@trpc/react-query/shared'

type Order = UseTRPCQueryResult<RouterOutput["viewer"]["orders"]["getOrder"], unknown>

interface OrderDetailsProps {
  orderQuery: Order
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderQuery }) => {
  const order = orderQuery.data?.data
  
  const utils = trpc.useUtils()
  
  const { 
    isReimbursementPending,
    handleOrderProductRejection,
    updateRejectedQuantity
  } = useOrderRejection(order, () => utils.viewer.orders.getOrder.invalidate())
  
  const {
    handleStatusChange,
    extendReturnDate,
    handleCancelAcceptedOrder,
    isActionLoading,
    sendOrderAcceptanceMail,
    createDamageReplacement
  } = useOrderActions(order?.id, () => orderQuery.refetch())
  
  // Only fetch return details when we have an order with returns
  const returnReplacementDetails = trpc.viewer.orders.getOrderReturnDetails.useQuery(
    { orderId: order?.id || 0 },
    { 
      enabled: !!order?.id && (order?._count?.return || 0) > 0,
      refetchOnWindowFocus: false,
    }
  )

  if (!order) {
    return null
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <OrderDetailsHeader 
        order={order} 
        isReimbursementPending={isReimbursementPending} 
      />
      
      { order?.address && <ShippingDetails 
        address={order.address}
        isEditable={!['SHIPPED', 'DELIVERED'].includes(order.orderStatus)}
        orderId={order.id}
        onAddressUpdated={() => orderQuery.refetch()}
      />} 
      {/* address edit */}
      
      <OrderActionsPanel
        order={order}
        onStatusChange={handleStatusChange}
        onExtendReturnDate={extendReturnDate}
        handleCancelAcceptedOrder={handleCancelAcceptedOrder}
        sendOrderAcceptanceMail={sendOrderAcceptanceMail}
        isLoading={isActionLoading}
        />
      
      <OrderItemsTable
        orderProducts={order.orderProducts}
        orderStatus={order.orderStatus}
        isReimbursementPending={isReimbursementPending}
        onRejectedQuantityChange={updateRejectedQuantity}
        onUpdateRejectedItems={handleOrderProductRejection}
        orderId={order.id}
        createDamageReplacement={createDamageReplacement}
        onRefundProcessed={() => orderQuery.refetch()}
      />
      
      {order._count.return > 0 && (
        <ReturnsAndReplacements
          orderId={order.id}
          returnDetails={returnReplacementDetails.data?.data}
          isLoading={returnReplacementDetails.isLoading}
          onReturnUpdated={() => {
            returnReplacementDetails.refetch()
            orderQuery.refetch()
          }}
        />
      )}
    </div>
  )
}

export default OrderDetails