/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PaymentDetailsDialog from '@/components/dialogs/PaymentDetaisDialog'
import { redirect } from 'next/navigation'

interface OrderDetailsHeaderProps {
  order: any
  isReimbursementPending: boolean
}

const OrderDetailsHeader: React.FC<OrderDetailsHeaderProps> = ({ order }) => {
  const handleCreditNoteClick = () => {
    if (order.creditNoteId) {
      redirect(`/creditNotes?creditNoteIdParam=${order.creditNoteId}`)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Order : {order.id}</CardTitle>
            <CardDescription>Created on {new Date(order.createdAt).toDateString()}</CardDescription>
          </div>
          <Badge 
            variant={order.orderStatus === 'DELIVERED' ? 'default' : 'secondary'}
            className="text-lg"
          >
            {order.orderStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500">Total Amount</h3>
          <p className="text-lg">₹{+order.totalAmount}</p>
        </div>
        <div>
          <PaymentDetailsDialog payment={order.Payments} />
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-500">Product Count</h3>
          <p className="text-lg">{order.productCount}</p>
        </div>
        <div>
          <h3 
            className={`font-medium text-sm ${order.creditNoteId ? 'text-orange-500 cursor-pointer' : 'text-gray-500'}`}
            onClick={handleCreditNoteClick}
          >
            Credit Used {order.creditNoteId}
          </h3>
          <p className="text-lg">₹{order.creditUtilised || 0}</p>
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-500">Account Contact</h3>
          <p className="text-lg">{order.user.contactNumber}</p>
        </div>
        {order.deliveryDate && (
          <div className="gap-2">
            <h3 className="font-medium text-sm text-gray-500">Delivery Date</h3>
            <p className="text-lg">{new Date(Number(order.deliveryDate)).toDateString()}</p>
          </div>
        )}
        {order.deliveryDate && (
          <div>
            <h3 className="font-medium text-sm text-gray-500">Return Acceptance Date</h3>
            <p className="text-lg">{new Date(Number(order.returnAcceptanceDate)).toDateString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OrderDetailsHeader