import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { prismaTypes } from '@nonrml/prisma';
import { RouterOutput, trpc } from '@/app/_trpc/client';
import { ShiprocketTypes } from '@nonrml/shipping';
import { TRPCResponseStatus } from '@nonrml/common';

interface OrderActionsPanelProps {
  order: RouterOutput["viewer"]["orders"]["getOrder"]["data"]
  onStatusChange: (status: prismaTypes.OrderStatus) => Promise<void>
  handleCancelAcceptedOrder: (refundMode: "CREDIT"|"BANK") => Promise<void>
  sendOrderAcceptanceMail: (orderId: string) => Promise<void>
  onExtendReturnDate: (days: number, initialDate: number) => Promise<void>
  isLoading: boolean,
  shipOrder: (shippingDetails: ShiprocketTypes.OrderData) => Promise<{status: TRPCResponseStatus, message: string, data: string }>
}

const OrderActionsPanel: React.FC<OrderActionsPanelProps> = ({
  order,
  onStatusChange,
  shipOrder,
  onExtendReturnDate,
  sendOrderAcceptanceMail,
  handleCancelAcceptedOrder,
  isLoading
}) => {
  const [extendDays, setExtendDays] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isShipping, setIsShipping] = useState(false)

  // New state for shipping dialog
  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false)
  const [length, setLength] = useState<number>(10)
  const [breadth, setBreadth] = useState<number>(10)
  const [height, setHeight] = useState<number>(5)
  const [weight, setWeight] = useState<number>(0.5)

  if (!order) return <></>

  const handleExtendReturnDate = () => {
    if (extendDays > 0 && order.returnAcceptanceDate) {
      onExtendReturnDate(extendDays, Number(order.returnAcceptanceDate))
    }
  }

  const handleRefundModeSelection = async (refundMode: "CREDIT" | "BANK") => {
    setIsDialogOpen(false)
    await handleCancelAcceptedOrder(refundMode)
  }

  // Ship Order Handler
  const handleShipOrder = async () => {
    try {
      setIsShipping(true)

      const shiprocketOrder: ShiprocketTypes.OrderData = {
        orderId: `ORD-${order.id}${order.idVarChar}`,
        orderDate: new Date(order.createdAt).toISOString(),
        pickupLocation: "Primary",
        billing: {
          customerName: order.address!.contactName!,
          address: order.address!.location!,
          city: order.address!.city,
          pincode: Number(order.address!.pincode!),
          state: order.address!.state,
          country: "India",
          phone: Number(order.address!.contactNumber.replace(/\D/g, "").slice(-10))
        },
        shippingIsBilling: true,
        orderItems: order.orderProducts.map(item => ({
          name: item.productVariant.product.sku,
          sku: item.productVariant.product.sku,
          units: item.quantity,
          sellingPrice: item.price,
        })),
        paymentMethod: order.Payments?.paymentMethod === "COD" ? "COD" : "Prepaid",
        subTotal: order.totalAmount,
        dimensions: {
          length,
          breadth,
          height
        },
        weight
      }

      const response = await shipOrder(shiprocketOrder);
      // ShiprocketShipping.ShiprocketShipping.createOrder(shiprocketOrder)
      // here is response

      if (response.data) {
        alert(`Shipment Created! Order ID: ${response.orderId}`)
        await onStatusChange("SHIPPED")
      } else {
        alert(`Failed to create shipment: ${response.error}`)
      }
    } catch (err) {
      console.error("Error creating shipment:", err)
      alert("Something went wrong while creating shipment.")
    } finally {
      setIsShipping(false)
      setIsShipDialogOpen(false)
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
          <>
            {/* Ship Order Dialog */}
            <AlertDialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  className="text-black"
                  variant="secondary"
                  disabled={isLoading || isShipping}
                >
                  Ship Order
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Enter Package Details</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please provide the package dimensions and weight before shipping.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Length (cm)"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Breadth (cm)"
                    value={breadth}
                    onChange={(e) => setBreadth(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isShipping}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleShipOrder}
                    disabled={isShipping}
                  >
                    {isShipping ? 'Creating Shipment...' : 'Confirm & Ship'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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