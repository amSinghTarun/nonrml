/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShiprocketShipping, ShiprocketTypes } from '@nonrml/shipping'
import { Loader2 } from 'lucide-react'
import { RouterOutput } from '@/app/_trpc/client'
import { useReturnManagement } from './hooks/useReturnManagement'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { AlertDialogFooter, AlertDialogHeader } from '../ui/alert-dialog'

interface ReturnsAndReplacementsProps {
  order: RouterOutput["viewer"]["orders"]["getOrder"]["data"]
  orderId: number
  returnDetails: RouterOutput["viewer"]["orders"]["getOrderReturnDetails"]["data"] | undefined
  isLoading: boolean
  onReturnUpdated: () => void
}

const ReturnsAndReplacements: React.FC<ReturnsAndReplacementsProps> = ({
  order,
  returnDetails,
  isLoading
}) => {
  const {
    isStatusChangeLoading,
    handleReplacementOrderStatusChange
  } = useReturnManagement()

  const [isShipDialogOpen, setIsShipDialogOpen] = useState(false)
  const [length, setLength] = useState<number>(10)
  const [breadth, setBreadth] = useState<number>(10)
  const [height, setHeight] = useState<number>(5)
  const [weight, setWeight] = useState<number>(0.5)
  const [isShipping, setIsShipping] = useState(false)
  const [currentReplacementOrder, setCurrentReplacementOrder] = useState<any>(null)

  const hasItemsToReplace = (returnOrder: any) => {
    if (returnOrder.returnType !== "REPLACEMENT" || !returnOrder.returnItems) {
      return true
    }
    const totalReplaceableQuantity = returnOrder.returnItems.reduce((total: number, item: any) => {
      const returnQuantity = item.quantity || 0
      const rejectedQuantity = item.rejectedQuantity || 0
      const nonReplaceableQuantity = item.ReplacementItem?.nonReplacableQuantity || 0
      return total + Math.max(0, returnQuantity - rejectedQuantity - nonReplaceableQuantity)
    }, 0)
    return totalReplaceableQuantity > 0
  }

  // ✅ Ship Replacement Handler (Real Data)
  const handleShipReplacement = async () => {
    if (!currentReplacementOrder || !order?.address) {
      alert("Missing order address or replacement order details.")
      return
    }

    try {
      setIsShipping(true)

      const itemDetails = currentReplacementOrder.items.map((item: any) => {
        const matchedProduct = order.orderProducts.find(
          (product) => product.id === item.orderProductId
        );

        if(!matchedProduct?.price)
          throw new Error(`${matchedProduct?.productVariantId} has no price`)
        else
          currentReplacementOrder.totalAmount += matchedProduct.price

        return {
          name: item.productVariant?.product?.name || item.name,
          sku: item.productVariant?.product?.sku || item.sku,
          units: item.quantity || item.units,
          sellingPrice: matchedProduct?.price || 0,
        };
      });

      // get the <sellingPrice> and if not avl then throw also calc the <totalAmout>

      const shiprocketOrder: ShiprocketTypes.OrderData = {
        orderId: `REPL-${currentReplacementOrder.id}`,
        orderDate: new Date().toISOString(),
        pickupLocation: "Primary",
        billing: {
          customerName: order.address.contactName,
          address: order.address.location,
          city: order.address.city,
          pincode: Number(order.address.pincode),
          state: order.address.state,
          country: "India",
          phone: Number(
            String(order.address.contactNumber)
              .replace(/\D/g, "")
              .slice(-10)
          )
        },
        shippingIsBilling: true,
        orderItems: itemDetails,
        paymentMethod: "Prepaid",
        subTotal: currentReplacementOrder.totalAmount,
        dimensions: { length, breadth, height },
        weight
      }

      const response = await ShiprocketShipping.ShiprocketShipping.createOrder(shiprocketOrder)

      if (response.success) {
        alert(`Replacement Shipment Created! Order ID: ${response.orderId}`)
        await handleReplacementOrderStatusChange(currentReplacementOrder.id, "SHIPPED")
      } else {
        alert(`Failed to create shipment: ${response.error}`)
      }
    } catch (err) {
      console.error("Error creating replacement shipment:", err)
      alert("Something went wrong while creating shipment.")
    } finally {
      setIsShipping(false)
      setIsShipDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading return details...</span>
      </Card>
    )
  }

  if (!returnDetails || returnDetails.length === 0) {
    return null
  }

  return (
    <Accordion type="single" collapsible className="w-full p-1">
      <AccordionItem value="returns">
        <AccordionTrigger>
          <CardTitle>Returns & Replacements</CardTitle>
        </AccordionTrigger>
        <AccordionContent>
          {returnDetails.map((returnOrder) => {
            const showReplacementButtons = hasItemsToReplace(returnOrder)

            return (
              <Card key={returnOrder.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-end gap-2 pt-4">
                    {(returnOrder.returnStatus === "ASSESSED" && returnOrder.ReplacementOrder) && (
                      <>
                        {returnOrder.ReplacementOrder?.status === "PROCESSING" && showReplacementButtons && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setCurrentReplacementOrder({
                                id: returnOrder.ReplacementOrder?.id,
                                items: returnOrder.returnItems || [],
                              })
                              setIsShipDialogOpen(true)
                            }}
                          >
                            Ship Replacement
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </AccordionContent>
      </AccordionItem>

      {/* ✅ Ship Replacement Dialog */}
      <AlertDialog open={isShipDialogOpen} onOpenChange={setIsShipDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Package Details</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide the package dimensions and weight before shipping.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Input type="number" placeholder="Length (cm)" value={length} onChange={(e) => setLength(Number(e.target.value))} />
            <Input type="number" placeholder="Breadth (cm)" value={breadth} onChange={(e) => setBreadth(Number(e.target.value))} />
            <Input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
            <Input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isShipping}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleShipReplacement} disabled={isShipping}>
              {isShipping ? 'Creating Shipment...' : 'Confirm & Ship'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Accordion>
  )
}

export default ReturnsAndReplacements