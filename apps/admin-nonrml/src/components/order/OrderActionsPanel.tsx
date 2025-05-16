import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { prismaTypes } from '@nonrml/prisma'
import { RouterOutput } from '@/app/_trpc/client'

interface OrderActionsPanelProps {
  order: RouterOutput["viewer"]["orders"]["getOrder"]["data"]
  onStatusChange: (status: prismaTypes.OrderStatus) => Promise<void>
  onExtendReturnDate: (days: number, initialDate: number) => Promise<void>
  isLoading: boolean
}

const OrderActionsPanel: React.FC<OrderActionsPanelProps> = ({
  order,
  onStatusChange,
  onExtendReturnDate,
  isLoading
}) => {
  const [extendDays, setExtendDays] = useState<number>(0)
  if(!order)
    return <></>
  const handleExtendReturnDate = () => {
    if (extendDays > 0 && order.returnAcceptanceDate) {
      onExtendReturnDate(extendDays, Number(order.returnAcceptanceDate))
    }
  }
  
  return (
    <Card>
      <CardHeader className="font-bold">Order Actions</CardHeader>
      <CardContent className="gap-2 flex flex-row flex-wrap items-center">
        {order.orderStatus === "PENDING" && (
          <>
            <Button
              variant="secondary"
              className="text-black"
              onClick={() => onStatusChange("ACCEPTED")}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Accept Order'}
            </Button>
            <Button
              variant="secondary"
              className="text-black"
              onClick={() => onStatusChange("CANCELED")}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Cancel Order'}
            </Button>
          </>
        )}
        
        {order.orderStatus === "ACCEPTED" && (
          <Button
            variant="secondary"
            className="text-black"
            onClick={() => console.log("ship order")} // This is a placeholder for shipping functionality
            disabled={isLoading}
          >
            Ship Order
          </Button>
        )}
        
        {(order.orderStatus === "SHIPPED" || order.orderStatus === "ACCEPTED") && (
          <Button
            variant="secondary"
            className="text-black"
            onClick={() => onStatusChange("DELIVERED")}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Mark Delivered'}
          </Button>
        )}
        
        {order.deliveryDate && (
          <div className="flex items-center gap-2 bg-black p-1 rounded-sm">
            <input 
              min={1}
              type="number"
              className="border border-black w-20 text-black text-center rounded-sm text-md outline-none"
              placeholder="Enter days"
              aria-label="Number of days to extend return date"
              value={extendDays || ''}
              onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
            />
            <Button 
              onClick={handleExtendReturnDate}
              disabled={isLoading || extendDays <= 0}
            >
              {isLoading ? 'Extending...' : 'Extend Return Date'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OrderActionsPanel
