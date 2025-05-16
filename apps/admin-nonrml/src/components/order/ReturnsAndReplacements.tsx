/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { useReturnManagement } from './hooks/useReturnManagement'
import { Loader2 } from 'lucide-react'
import { prismaTypes } from '@nonrml/prisma'
import { RouterOutput } from '@/app/_trpc/client'

interface ReturnsAndReplacementsProps {
  orderId: string
  returnDetails: RouterOutput["viewer"]["orders"]["getOrderReturnDetails"]["data"] | undefined
  isLoading: boolean
  onReturnUpdated: () => void
}

const ReturnsAndReplacements: React.FC<ReturnsAndReplacementsProps> = ({
  orderId,
  returnDetails,
  isLoading,
}) => {
  const {
    nonReplaceQuantity,
    setNonReplaceQuantity,
    isCancelLoading,
    isUpdateLoading,
    isFinaliseLoading,
    isNonReplaceLoading,
    isCreditNoteLoading,
    isStatusChangeLoading,
    handleReturnReviewChange,
    handleReturnStatusChange,
    handleReturnReviewSubmit,
    handleReplacementReviewSubmit,
    handleCancelReturn,
    handleNonReplace,
    handleCreateCreditNote,
    handleReplacementOrderStatusChange
  } = useReturnManagement()
  
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
          {returnDetails.map((returnOrder) => (
            <Card key={returnOrder.id} className="mb-4">
              <CardHeader>
                <h3 className="text-base font-semibold">
                  {returnOrder.returnType}: {returnOrder.createdAt.toDateString()}
                </h3>
                <div className="flex flex-col gap-4 mt-4 divide-y">
                  {/* Return Order Details */}
                  <div className="grid grid-cols-3 text-sm gap-4 pb-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Return Id:</h4>
                      <p>{returnOrder.id}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Return Status:</h4>
                      <p>{returnOrder.returnStatus}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Return Shipment Id:</h4>
                      <p>{returnOrder.returnShipmentId || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Replacement Order Details */}
                  {returnOrder.ReplacementOrder && (
                    <div className="grid grid-cols-3 text-sm gap-4 py-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Replacement Id:</h4>
                        <p>{returnOrder.ReplacementOrder.id}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Replacement Status:</h4>
                        <p>{returnOrder.ReplacementOrder.status}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-500">Replacement Shipment Id:</h4>
                        <p>{returnOrder.ReplacementOrder.shipmentId || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Credit Note Details */}
                  {returnOrder.creditNote && returnOrder.creditNote.length > 0 && (
                    <div className="py-4">
                      <h4 className="font-medium text-sm text-gray-500 mb-2">Credit Notes:</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {returnOrder.creditNote.map((creditNote, index) => (
                          <div key={index} className="border p-2 rounded-md">
                            <div className="mb-1">
                              <span className="font-medium text-sm text-gray-500">Code: </span>
                              <span 
                                className="text-orange-500 cursor-pointer"
                                onClick={() => redirect(`/creditNotes?orderId=${orderId}`)}
                              >
                                {creditNote.creditCode}
                              </span>
                            </div>
                            <div className="mb-1">
                              <span className="font-medium text-sm text-gray-500">Value: </span>
                              <span>₹{+creditNote.value}</span>
                            </div>
                            <div>
                              <span className="font-medium text-sm text-gray-500">Status: </span>
                              <span>{!creditNote.remainingValue ? 'Redeemed' : 'Active'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    {returnOrder.returnStatus === 'PENDING' && (
                      <>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelReturn(returnOrder.id)}
                          disabled={isCancelLoading}
                        >
                          {isCancelLoading ? 'Canceling...' : 'Cancel Return'}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleReturnStatusChange(returnOrder.id, "ALLOWED")}
                          disabled={isUpdateLoading}
                        >
                          {isUpdateLoading ? 'Processing...' : 'Allow Return'}
                        </Button>
                      </>
                    )}
                    
                    {(returnOrder.returnStatus === "ALLOWED" || returnOrder.returnStatus === "IN_TRANSIT") && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReturnStatusChange(returnOrder.id, "RECEIVED")}
                        disabled={isUpdateLoading}
                      >
                        {isUpdateLoading ? 'Processing...' : 'Mark Received'}
                      </Button>
                    )}
                    
                    {(returnOrder.returnStatus === "RECEIVED" && returnOrder.returnType === "RETURN") && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReturnReviewSubmit(returnOrder.id)}
                        disabled={isUpdateLoading}
                      >
                        {isUpdateLoading ? 'Submitting...' : 'Submit Return Review'}
                      </Button>
                    )}
                    
                    {(returnOrder.returnStatus === "RECEIVED" && returnOrder.returnType === "REPLACEMENT") && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {if(returnOrder.ReplacementOrder?.id) handleReplacementReviewSubmit(returnOrder.ReplacementOrder.id)}}
                        disabled={isFinaliseLoading}
                      >
                        {isFinaliseLoading ? 'Processing...' : 'Finalize Replacement'}
                      </Button>
                    )}
                    
                    {(returnOrder.returnStatus === "ASSESSED" && returnOrder.ReplacementOrder) && (
                      <>
                        {returnOrder.ReplacementOrder?.status === "PROCESSING" && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => { if(returnOrder.ReplacementOrder?.id) handleCreateCreditNote(returnOrder.ReplacementOrder.id)}}
                              disabled={isCreditNoteLoading}
                            >
                              {isCreditNoteLoading ? 'Processing...' : 'Issue Credit'}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => console.log('Ship replacement')} // Placeholder for shipping functionality
                            >
                              Ship Replacement
                            </Button>
                          </>
                        )}
                        
                        {(returnOrder.ReplacementOrder?.status === "PROCESSING" || returnOrder.ReplacementOrder?.status === "SHIPPED") && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {if(returnOrder.ReplacementOrder?.id) handleReplacementOrderStatusChange(returnOrder.ReplacementOrder.id, "DELIVERED")}}
                            disabled={isStatusChangeLoading}
                          >
                            {isStatusChangeLoading ? 'Processing...' : 'Mark Delivered'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <ReturnItemsTable 
                  returnItems={returnOrder.returnItems}
                  returnStatus={returnOrder.returnStatus}
                  returnType={returnOrder.returnType}
                  onReviewChange={handleReturnReviewChange}
                  onNonReplaceChange={(replacementOrderProductId) => {
                    handleNonReplace(replacementOrderProductId, nonReplaceQuantity);
                  }}
                  setNonReplaceQuantity={setNonReplaceQuantity}
                  isNonReplaceLoading={isNonReplaceLoading}
                  replacementOrderStatus={returnOrder.ReplacementOrder?.status}
                />
              </CardContent>
            </Card>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ReturnItemsTable component
interface ReturnItemsTableProps {
  returnItems: any[]
  returnStatus: string
  returnType: string
  onReviewChange: (returnItemId: number, field: 'rejectedQuantity' | 'rejectReason', value: string | number) => void
  onNonReplaceChange: (replacementOrderProductId: number) => void
  setNonReplaceQuantity: (quantity: number) => void
  isNonReplaceLoading: boolean
  replacementOrderStatus?: prismaTypes.ReplacementOrderStatus
}

const ReturnItemsTable: React.FC<ReturnItemsTableProps> = ({
  returnItems,
  returnStatus,
  returnType,
  onReviewChange,
  onNonReplaceChange,
  setNonReplaceQuantity,
  isNonReplaceLoading,
  replacementOrderStatus
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Details</TableHead>
          <TableHead>User Reasoning</TableHead>
          <TableHead>Admin Review</TableHead>
          {returnType === "REPLACEMENT" && <TableHead>Non-Replaced</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {returnItems.map((item) => (
          <TableRow key={item.id} className="text-xs">
            <TableCell className="space-y-4 align-top">
              <p className="font-semibold">P.O Id: {item.orderProductId}</p>
              <p>Quantity | {item.quantity}</p>
              {returnType === "REPLACEMENT" && (
                <p>Exchange Size | {item.ReplacementItem?.productVariant.size || 'N/A'}</p>
              )}
            </TableCell>
            <TableCell className="space-y-2 divide-y align-top">
              {item.referenceImage && (
                <Image 
                  src={item.referenceImage} 
                  alt={`Return item ${item.id}`} 
                  width={120} 
                  height={120}
                />
              )}
              <p className="pt-2">{item.returnReason || 'No reason provided'}</p>
            </TableCell>
            <TableCell className="align-top">
              <label htmlFor={`reject-qty-${item.id}`} className="block mb-1">Reject:</label>
              <Input
                id={`reject-qty-${item.id}`}
                min={0}
                max={item.quantity}
                type="number"
                defaultValue={item.rejectedQuantity || 0}
                className="mb-4"
                onChange={(e) => onReviewChange(
                  item.id,
                  'rejectedQuantity',
                  parseInt(e.target.value) || 0
                )}
                disabled={returnStatus !== "RECEIVED"}
              />
              <label htmlFor={`reject-reason-${item.id}`} className="block mb-1">Reason:</label>
              <Textarea
                id={`reject-reason-${item.id}`}
                className="min-h-24"
                onChange={(e) => onReviewChange(
                  item.id,
                  'rejectReason',
                  e.target.value
                )}
                defaultValue={item.rejectReason || ""}
                placeholder="Reason for rejection"
                disabled={returnStatus !== 'RECEIVED'}
              />
            </TableCell>
            {returnType === "REPLACEMENT" && (
              <TableCell className="space-y-3 align-top">
                <label htmlFor={`non-replace-${item.id}`} className="block mb-1">
                  Non-Replace Quantity
                </label>
                <input
                  id={`non-replace-${item.id}`}
                  type="number"
                  disabled={!!item.ReplacementItem?.nonReplaceAction}
                  min={0}
                  className="w-full text-center outline-none bg-black text-white p-1 rounded-sm mb-2"
                  max={item.quantity - (item.rejectedQuantity || 0)}
                  onChange={e => setNonReplaceQuantity(parseInt(e.target.value) || 0)}
                  defaultValue={item.ReplacementItem?.nonReplacableQuantity || 0}
                />
                {item.ReplacementItem?.nonReplaceAction === null && (
                  <Button 
                    size="sm"
                    disabled={replacementOrderStatus === "DELIVERED" || isNonReplaceLoading}
                    onClick={() => onNonReplaceChange(item.ReplacementItem?.id)}
                  >
                    {isNonReplaceLoading ? 'Updating...' : 'Update'}
                  </Button>
                )}
                {item.ReplacementItem?.nonReplaceAction && (
                  <p className="text-sm mt-2">
                    Non-Avl Refund Mode: {item.ReplacementItem?.nonReplaceAction}
                  </p>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ReturnsAndReplacements