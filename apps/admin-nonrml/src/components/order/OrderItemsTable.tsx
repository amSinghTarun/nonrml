/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'

interface OrderItemsTableProps {
  orderProducts: any[]
  orderStatus: prismaTypes.OrderStatus
  isReimbursementPending: boolean
  onRejectedQuantityChange: (id: string, quantity: number) => void
  onUpdateRejectedItems: () => Promise<void>
  orderId: number
  onRefundProcessed: () => void
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderProducts,
  orderStatus,
  isReimbursementPending,
  onRejectedQuantityChange,
  onUpdateRejectedItems,
  orderId,
  onRefundProcessed
}) => {
  const refundMutation = trpc.viewer.payment.initiateUavailibiltyRefund.useMutation({
    onSuccess: onRefundProcessed
  })
  
  const handleRefundUnavailable = async () => {
    await refundMutation.mutateAsync({ orderId })
  }
  
  const isEditable = orderStatus === "PENDING" || orderStatus === "ACCEPTED"
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row justify-between items-center">
          <span>Order Items</span>
          {isReimbursementPending && (
            <div className="flex flex-col items-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRefundUnavailable}
                disabled={refundMutation.isLoading}
              >
                {refundMutation.isLoading ? "Refund Under process..." : "Initiate Unavailable Refund"}
              </Button>
              <p className="text-xs text-gray-500 mt-1">* Initiate refund only once, so do it right before creating shipment</p>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Product</span>
                  {isEditable && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={onUpdateRejectedItems}
                    >
                      UPDATE
                    </Button>
                  )}
                </div>
              </TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Return Quantity</TableHead>
              <TableHead>Replacement Quantity</TableHead>
              <TableHead>Rejected Quantity</TableHead>
              <TableHead>Reimbursed Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderProducts.map((orderProduct) => (
              <TableRow key={orderProduct.id}>
                <TableCell>
                  <div className="flex flex-col gap-1 text-black font-bold">
                    <span>{orderProduct.productVariant.product.sku}</span>
                    <span>P.O Id: {orderProduct.id}</span>
                    <div className="flex flex-row justify-between">
                      {orderProduct.productVariant.product.productImages[0] && (
                        <Image 
                          src={orderProduct.productVariant.product.productImages[0].image} 
                          alt={`${orderProduct.productVariantId}`} 
                          width={120} 
                          height={120}
                        />
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{orderProduct.productVariant.size}</TableCell>
                <TableCell>₹{+orderProduct.price}</TableCell>
                <TableCell>{orderProduct.quantity}</TableCell>
                <TableCell>{orderProduct.returnQuantity || 0}</TableCell>
                <TableCell>{orderProduct.replacementQuantity || 0}</TableCell>
                <TableCell>
                  {isEditable ? (
                    <input 
                      className="h-full w-full py-10 px-2 border rounded"
                      type="number"
                      min={orderProduct.reimbursedQuantity || 0}
                      max={orderProduct.quantity}
                      onChange={(e) => onRejectedQuantityChange(orderProduct.id, parseInt(e.target.value) || 0)}
                      defaultValue={orderProduct.rejectedQuantity?.toString() || '0'}
                      aria-label={`Rejected quantity for ${orderProduct.productVariant.product.sku}`}
                    />
                  ) : (
                    orderProduct.rejectedQuantity || 0
                  )}
                </TableCell>
                <TableCell>{orderProduct.reimbursedQuantity || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default OrderItemsTable