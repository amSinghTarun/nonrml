import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { prismaTypes } from '@nonrml/prisma'
import {RouterOutput } from '@/app/_trpc/client'

interface OrderActionsPanelProps {
  order: RouterOutput["viewer"]["orders"]["getOrder"]["data"]
  onStatusChange: (status: prismaTypes.OrderStatus) => Promise<void>
  handleCancelAcceptedOrder: (refundMode: "CREDIT"|"BANK") => Promise<void>
  sendOrderAcceptanceMail: (orderId: string) => Promise<void>
  onExtendReturnDate: (days: number, initialDate: number) => Promise<void>
  isLoading: boolean
}

const OrderActionsPanel: React.FC<OrderActionsPanelProps> = ({
  order,
  onStatusChange,
  onExtendReturnDate,
  sendOrderAcceptanceMail,
  handleCancelAcceptedOrder,
  isLoading
}) => {
  const [extendDays, setExtendDays] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  if(!order)
    return <></>
    
  const handleExtendReturnDate = () => {
    if (extendDays > 0 && order.returnAcceptanceDate) {
      onExtendReturnDate(extendDays, Number(order.returnAcceptanceDate))
    }
  }

  const handleRefundModeSelection = async (refundMode: "CREDIT" | "BANK") => {
    setIsDialogOpen(false)
    await handleCancelAcceptedOrder(refundMode)
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
          <>
            <Button
              className="text-black"
              variant="secondary"
              onClick={() => console.log("ship order")} // This is a placeholder for shipping functionality
              disabled={isLoading}
            >
              Ship Order
            </Button>
            <Button
              variant="secondary"
              className="text-black"
              onClick={() => sendOrderAcceptanceMail(`ORD-${order.id}${order.idVarChar}`)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Send Confirmation Mail'}
            </Button>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="text-white"
                  disabled={isLoading}
                >
                  Cancel Accepted Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Select Refund Method</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please choose how you would like to process the refund for this cancelled order.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                  <AlertDialogCancel disabled={isLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="outline"
                    onClick={() => handleRefundModeSelection("CREDIT")}
                    disabled={isLoading}
                    className="text-black"
                  >
                    {isLoading ? 'Processing...' : 'Refund to Credit'}
                  </Button>
                  <AlertDialogAction
                    onClick={() => handleRefundModeSelection("BANK")}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Refund to Bank'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
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
          <div className='flex flex-row space-x-5'>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OrderActionsPanel