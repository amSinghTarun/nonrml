/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { RouterInput, trpc } from '@/app/_trpc/client'
import { prismaTypes } from '@nonrml/prisma'
import {$Enums as prismaEnums } from "@prisma/client";

interface OrderItemsTableProps {
  orderProducts: any[]
  orderStatus: prismaTypes.OrderStatus
  isReimbursementPending: boolean
  onRejectedQuantityChange: (id: string, quantity: number) => void
  onUpdateRejectedItems: () => Promise<void>
  createDamageReplacement: (returnOrderData: RouterInput["viewer"]["return"]["initiateReturn"]) => Promise<void>
  orderId: number
  onRefundProcessed: () => void
}

interface SelectedProduct {
  quantity: number;
  orderProductId: number;
  exchangeVariant?: number | undefined;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  orderProducts,
  orderStatus,
  isReimbursementPending,
  onRejectedQuantityChange,
  onUpdateRejectedItems,
  createDamageReplacement,
  orderId,
  onRefundProcessed
}) => {
  const [isCreateReplacementDialogOpen, setIsCreateReplacementDialogOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: SelectedProduct }>({})
  const [returnStatus, setReturnStatus] = useState<prismaTypes.ReturnStatus>("ASSESSED")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const refundMutation = trpc.viewer.payment.initiateUavailibiltyRefund.useMutation({
    onSuccess: onRefundProcessed
  })
  
  const handleRefundUnavailable = async () => {
    await refundMutation.mutateAsync({ orderId })
  }

  // Handle product selection for replacement
  const handleProductSelection = (orderProductId: number, isSelected: boolean) => {
    if (isSelected) {
      const orderProduct = orderProducts.find(p => p.id === orderProductId)
      if (orderProduct) {
        setSelectedProducts(prev => ({
          ...prev,
          [orderProductId]: {
            quantity: 1,
            orderProductId: orderProductId,
            exchangeVariant: orderProduct.productVariantId // Same size as original
          }
        }))
      }
    } else {
      setSelectedProducts(prev => {
        const newSelected = { ...prev }
        delete newSelected[orderProductId]
        return newSelected
      })
    }
  }

  // Handle quantity change
  const handleQuantityChange = (orderProductId: number, quantity: number) => {
    setSelectedProducts(prev => ({
      ...prev,
      [orderProductId]: {
        ...prev[orderProductId],
        quantity: Math.max(1, quantity)
      }
    }))
  }

  // Get available quantity for replacement
  const getAvailableQuantity = (orderProduct: any) => {
    const totalQuantity = orderProduct.quantity || 0
    const returnQuantity = orderProduct.returnQuantity || 0
    const replacementQuantity = orderProduct.replacementQuantity || 0
    const rejectedQuantity = orderProduct.rejectedQuantity || 0
    
    return totalQuantity - returnQuantity - replacementQuantity - rejectedQuantity
  }

  // Handle create replacement submission
  const handleCreateReplacementSubmit = async () => {
    const productsArray = Object.values(selectedProducts)
    
    if (productsArray.length === 0) {
      alert("Please select at least one product")
      return
    }

    setIsSubmitting(true)

    const returnData: RouterInput["viewer"]["return"]["initiateReturn"] = {
      orderId: orderId,
      returnType: "REPLACEMENT",
      returnReason: "Admin created replacement", 
      products: productsArray
    }

    try {
      await createDamageReplacement(returnData)
      setIsCreateReplacementDialogOpen(false)
      setSelectedProducts({})
    } catch (error) {
      console.error("Error creating replacement:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset dialog state
  const resetDialog = () => {
    setIsCreateReplacementDialogOpen(false)
    setSelectedProducts({})
    setReturnStatus("RECEIVED")
  }
  
  const isEditable = orderStatus === "PENDING" || orderStatus === "ACCEPTED"
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row justify-between items-center">
          <span>Order Items</span>
          <div className="flex items-center gap-2">
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
            
            {/* Create Replacement Dialog */}
            <AlertDialog open={isCreateReplacementDialogOpen} onOpenChange={setIsCreateReplacementDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="text-black"
                >
                  Create Replacement
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Create Replacement Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select products and quantities for replacement. Exchange variants will automatically match the original product size.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                  {/* Return Status Selection */}
                  <div className="space-y-2">
                    <label htmlFor="return-status" className="block text-sm font-medium text-gray-700">
                      Return Status
                    </label>
                    <Select value={returnStatus} onValueChange={(value: prismaTypes.ReturnStatus) => setReturnStatus(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select return status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(prismaEnums.ReturnStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Default is set to RECEIVED. Change if needed for the replacement order.
                    </p>
                  </div>

                  {/* Products Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Select</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Available Qty</TableHead>
                        <TableHead>Replace Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderProducts.map((orderProduct) => {
                        const availableQty = getAvailableQuantity(orderProduct)
                        const isSelected = selectedProducts[orderProduct.id]
                        
                        if (availableQty <= 0) return null

                        return (
                          <TableRow key={orderProduct.id}>
                            <TableCell>
                              <Checkbox
                                checked={!!isSelected}
                                onCheckedChange={(checked) => 
                                  handleProductSelection(orderProduct.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                {orderProduct.productVariant?.product.productImages?.[0] && (
                                  <Image
                                    src={orderProduct.productVariant.product.productImages[0].image}
                                    alt="Product"
                                    width={40}
                                    height={40}
                                    className="rounded object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium text-sm">
                                    {orderProduct.productVariant?.product.sku}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    P.O ID: {orderProduct.id}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Price: ₹{+orderProduct.price}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{orderProduct.productVariant?.size}</span>
                              <p className="text-xs text-gray-500">
                                Variant ID: {orderProduct.productVariantId}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{availableQty}</span>
                            </TableCell>
                            <TableCell>
                              {isSelected && (
                                <Input
                                  type="number"
                                  min={1}
                                  max={availableQty}
                                  value={isSelected.quantity}
                                  onChange={(e) => 
                                    handleQuantityChange(orderProduct.id, parseInt(e.target.value) || 1)
                                  }
                                  className="w-20"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* No available products message */}
                  {orderProducts.every(product => getAvailableQuantity(product) <= 0) && (
                    <div className="text-center py-4 text-gray-500">
                      No products available for replacement. All products are already returned, replaced, or rejected.
                    </div>
                  )}

                  {/* Selected Products Summary */}
                  {Object.keys(selectedProducts).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <h4 className="font-medium mb-2">Selected Products for Replacement:</h4>
                      <div className="mb-2 text-sm">
                        <span className="font-medium">Return Status:</span> 
                        <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                          {returnStatus}
                        </span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {Object.values(selectedProducts).map((product) => {
                          const orderProduct = orderProducts.find(p => p.id === product.orderProductId)
                          return (
                            <li key={product.orderProductId} className="flex justify-between">
                              <span>
                                {orderProduct?.productVariant?.product.sku} (Size: {orderProduct?.productVariant?.size})
                              </span>
                              <span>
                                Qty: {product.quantity} | Exchange Variant: {product.exchangeVariant}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel onClick={resetDialog}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCreateReplacementSubmit}
                    disabled={Object.keys(selectedProducts).length === 0 || isSubmitting}
                  >
                    {isSubmitting ? 'Creating Replacement...' : 'Create Replacement'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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