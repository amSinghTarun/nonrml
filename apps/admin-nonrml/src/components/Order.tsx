"use client"

import React, { useRef, useState } from 'react'
import { RouterOutput, trpc } from '@/app/_trpc/client'
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UseTRPCQueryResult } from '@trpc/react-query/shared'
import Image from 'next/image';
import { Edit2, Check, X } from 'lucide-react';
import { Textarea } from './ui/textarea'
import { redirect } from 'next/navigation'
import PaymentDetailsDialog from './dialogs/PaymentDetaisDialog'

type Order = UseTRPCQueryResult<RouterOutput["viewer"]["orders"]["getOrder"], unknown>

interface ReturnReview {
    [returnItemId: string]: {
      rejectedQuantity: number
      rejectReason: string
    }
}

export interface UpdateRejectedRef {
    [productSku: string]: {
      rejectedQuantity: number
      reimbursed: boolean
    }
  }
  
export interface ReturnFormData {
    products: {
      [key: string]: {
        id: string
        quantity: number
        reason: string
      }
    }
    isReplacement: boolean
  }

const OrderDetails = ({ orderQuery }: { orderQuery: Order }) => {
    // Early return if data is not available
    if (!orderQuery.data?.data) {
        return null;
    }

    const order = orderQuery.data.data;
    const [isReimbursementPending, setIsReimbursementPending] = useState(false)
    const utils = trpc.useUtils()
    const [isEditing, setIsEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState(order.address);
    const [returnReviews, setReturnReviews] = useState<ReturnReview>({})
    const updateRejected = useRef<UpdateRejectedRef>({});
    const updateNonAvl = useRef<number>(0);
    const extendReturnDateByDay = useRef<number>(0);
    const returnReplacementDetails = trpc.viewer.orders.getOrderReturnDetails.useQuery({ orderId: order.id });

    const mutations = {
        editOrder: trpc.viewer.orders.editOrder.useMutation({
            onSuccess: () => {
                setIsReimbursementPending(false)
                utils.viewer.orders.getOrder.invalidate();
            }
        }),
        refundUnavailableProduct: trpc.viewer.payment.initiateUavailibiltyRefund.useMutation({
            onSuccess: () => {
                orderQuery.refetch()
            }
        }),
        cancelReturn: trpc.viewer.return.cancelReturn.useMutation({
            onSuccess: () => {
                utils.viewer.orders.getOrder.invalidate()
            }
        }),
        updateReturnOrder: trpc.viewer.return.editReturn.useMutation({
            onSuccess: () => {
                orderQuery.refetch();
                // utils.viewer.orders.getOrder.invalidate()
            }
        }),
        createCreditNote: trpc.viewer.creditNotes.createCreditNote.useMutation({
            onSuccess: () => {
                orderQuery.refetch()
            }
        }),
        updateUserAddress: trpc.viewer.address.editAddressByAdmin.useMutation({
            onSuccess: () => {
                orderQuery.refetch()
            }
        }),
        updateNonReplaceQuantity: trpc.viewer.replacement.updateNonReplaceQuantity.useMutation({
            onSuccess: () => {
                returnReplacementDetails.refetch()
            }
        }),
        finaliseReturnAndMarkReplacementOrder: trpc.viewer.replacement.finaliseReturnAndMarkReplacementOrder.useMutation({
            onSuccess: () => {
                orderQuery.refetch()
            }
        })
    }

    const handlers = {
        handleEdit: () => {
            setIsEditing(true);
        },
        handleCancel: () => {
            setEditedAddress(order.address);
            setIsEditing(false);
        },
        handleSave: async () => {
            await mutations.updateUserAddress.mutateAsync(editedAddress)
            setIsEditing(false);
        },
        handleChange: (field:string, value:any) => {
            setEditedAddress(prev => ({
                ...prev,
                [field]: value
            }));
        },
        handleReturnReviewSubmit: (returnId: number) => {
            console.log(returnReviews)
            mutations.updateReturnOrder.mutate({
              returnId: returnId,
              returnStatus: "REVIEW_DONE",
              reviewData: returnReviews
            })
        },
        handleReplacementReviewSubmit: (replacementId: number) => {
            console.log(returnReviews)
            mutations.finaliseReturnAndMarkReplacementOrder.mutate({
              replacementOrderId: replacementId,
              reviewData: returnReviews
            })
        },
        handleReviewChange: (returnItemId: number, field: 'rejectedQuantity' | 'rejectReason', value: string | number) => {
            setReturnReviews(prev => ({
              ...prev,
              [returnItemId]: {
                ...prev[returnItemId],
                [field]: value
              }
            }))
        },
        handleOrderProductRejection: async () => {
            await mutations.editOrder.mutateAsync({
                orderId: order.id,
                productRejectStatus: updateRejected.current
            })
        },
        handleNonReplace: async (replacementOrderProductId: number,nonReplacementQuantity: number) => {
            await mutations.updateNonReplaceQuantity.mutateAsync({
                replacementOrderProductId,
                nonReplacementQuantity
            })
        },
        handleCNonReplaceableCN: async ( replacementOrderId: number ) => {
            await mutations.createCreditNote.mutateAsync({
                replacementOrderId
            })
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Main Order Information */}
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
                    <h3 className="cursor-pointer font-medium text-sm text-orange-500" onClick={() => order.creditNoteId && redirect(`/creditNotes?creditNoteIdParam=${order.creditNoteId}`)}> Credit Used {order.creditNoteId }</h3>
                    <p className="text-lg">₹{order.creditUtilised || 0}</p>
                </div>
                <div>
                    <h3 className="font-medium text-sm text-gray-500">Account Contact</h3>
                    <p className="text-lg">{order.user.contactNumber}</p>
                </div>
                {order.deliveryDate && (
                    <div className='gap-2'>
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

            {/** Shipping Details */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="font-bold">
                        Shipping Details
                    </div>
                    {!['SHIPPED', "DELIVERED"].includes(order.orderStatus) && !isEditing && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlers.handleEdit}
                        className="h-8 w-8 p-0"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    )}
                </CardHeader>
                <CardContent className="gap-4 flex flex-row flex-wrap">
                    {!isEditing ? (
                    <>
                        <div>
                        <h3 className="font-medium text-sm text-gray-500">Address</h3>
                        <p>{`${order.address.contactName}, ${order.address.location}, ${order.address.city}, ${order.address.state}`}</p>
                        </div>
                        <div>
                        <h3 className="font-medium text-sm text-gray-500">Pincode</h3>
                        <p>{order.address.pincode}</p>
                        </div>
                        <div>
                        <h3 className="font-medium text-sm text-gray-500">Mobile</h3>
                        <p>{`${order.address.countryCode} - ${order.address.contactNumber}`}</p>
                        </div>
                        <div>
                        <h3 className="font-medium text-sm text-gray-500">Email</h3>
                        <p>{order.address.email}</p>
                        </div>
                    </>
                    ) : (
                    <div className="w-full space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">Contact Name</h3>
                            <Input
                                value={editedAddress.contactName}
                                onChange={(e) => handlers.handleChange('contactName', e.target.value)}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">Location</h3>
                            <Input
                                value={editedAddress.location}
                                onChange={(e) => handlers.handleChange('location', e.target.value)}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">City</h3>
                            <Input
                                value={editedAddress.city}
                                onChange={(e) => handlers.handleChange('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">State</h3>
                            <Input
                                value={editedAddress.state}
                                onChange={(e) => handlers.handleChange('state', e.target.value)}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">Pincode</h3>
                            <Input
                                value={editedAddress.pincode}
                                onChange={(e) => handlers.handleChange('pincode', e.target.value)}
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">Contact Number</h3>
                            <div className="flex gap-2">
                            <Input
                                className="w-20"
                                value={editedAddress.countryCode}
                                onChange={(e) => handlers.handleChange('countryCode', e.target.value)}
                            />
                            <Input
                                value={editedAddress.contactNumber}
                                onChange={(e) => handlers.handleChange('contactNumber', e.target.value)}
                            />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-gray-500 mb-1">Email</h3>
                            <Input
                            value={editedAddress.email}
                            onChange={(e) => handlers.handleChange('email', e.target.value)}
                            />
                        </div>
                        </div>
                        <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlers.handleCancel}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handlers.handleSave}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Save Changes
                        </Button>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
                <CardHeader className='font-bold'>Order Actions</CardHeader>
                <CardContent className='gap-2 flex flex-row'>
                    { (order.orderStatus == "PENDING") && <>
                        <Button
                            className="text-black border border-stone-300 text-md p-2 bg-stone-300 rounded-lg hover:bg-stone-100"
                            onClick={async () => await mutations.editOrder.mutateAsync({orderId: order.id, status: "ACCEPTED"}) }
                        >Accept Order</Button>
                        <Button
                            className="text-black border border-stone-300 text-md p-2 bg-stone-300 rounded-lg hover:bg-stone-100" 
                            onClick={async () => await mutations.editOrder.mutateAsync({orderId: order.id, status: "CANCELED"}) }
                        >Cancel Order</Button>
                    </> }
                    { order.orderStatus == "ACCEPTED" && 
                        <Button
                        className="text-black border border-stone-300 text-md p-2 bg-stone-300 rounded-lg hover:bg-stone-100" 
                        onClick={async () => {console.log("ship order") }}
                        >Ship Order</Button>
                    }
                    { (order.orderStatus == "SHIPPED" || order.orderStatus == "ACCEPTED") && 
                        <Button
                            className="text-black border border-stone-300 text-md p-2 bg-stone-300 rounded-lg hover:bg-stone-100" 
                            onClick={async () => await mutations.editOrder.mutateAsync({ orderId: order.id, status: "DELIVERED" }) }
                        >Mark Delivered</Button>
                    }
                    {order.deliveryDate && (
                    <div className='gap-2 flex flex-row bg-black p-1 rounded-sm'>
                        <input 
                            min={1}
                            className='border border-black w-20 text-black text-center rounded-sm text-md outline-none'
                            type = "number"
                            placeholder="Enter days"
                            onChange={(e) => extendReturnDateByDay.current = +e.target.value}
                        />
                        <Button onClick={ async () => await mutations.editOrder.mutateAsync({ orderId: order.id, returnDateExtend: extendReturnDateByDay.current, initialReturnDate: Number(order.returnAcceptanceDate)}) }>Extend Return Date</Button>
                    </div>
                )}
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
                <CardHeader>
                <CardTitle className='flex flex-row justify-between'>
                    Order Items
                    {/** Reimbuse Rejected quantity */}
                    { isReimbursementPending && <button 
                        onClick = { async ()=> { await mutations.refundUnavailableProduct.mutateAsync({orderId: order.id}) }} 
                        className = 'px-2 bg-red-500 rounded-md text-sm hover:bg-stone-100 border border-stone-300'
                    >{mutations.refundUnavailableProduct.isLoading ? "Refund Under process..." : "Initiate Unavailable Refund"}</button> }

                </CardTitle>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>
                            <p> Product </p>
                            {(order.orderStatus == "PENDING" || order.orderStatus == "ACCEPTED") && <button onClick={ async () => { await handlers.handleOrderProductRejection(); updateRejected.current = {}}} className='cursor-pointer hover:bg-stone-100 p-1 border border-stone-300 bg-stone-300 rounded-md '>UPDATE</button>}
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
                    { order.orderProducts.map( (orderProduct) => {
                        
                        !isReimbursementPending && (orderProduct.reimbursedQuantity < ( orderProduct.rejectedQuantity || 0 )) && setIsReimbursementPending(true);
                        console.log(isReimbursementPending, orderProduct.reimbursedQuantity < ( orderProduct.rejectedQuantity || 0 ))

                        return (
                            <TableRow key={orderProduct.id}>
                            <TableCell>
                                <div className='flex flex-col gap-1 text-black font-bold'>
                                    <span>{orderProduct.productVariant.product.sku}</span>
                                    <span>P.O Id: {orderProduct.id}</span>
                                    <div className='flex flex-row justify-between'>
                                        <Image src={orderProduct.productVariant.product.productImages[0]!.image} alt={`${orderProduct.productVariantId}`} width={120} height={120}/>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{orderProduct.productVariant.size}</TableCell>
                            <TableCell>₹{+orderProduct.price}</TableCell>
                            <TableCell>{orderProduct.quantity}</TableCell>
                            <TableCell>{orderProduct.returnQuantity || 0}</TableCell>
                            <TableCell>{orderProduct.replacementQuantity || 0}</TableCell>
                            <TableCell> {
                                order.orderStatus == "PENDING" || order.orderStatus == "ACCEPTED" 
                                ? <input className='h-full w-full py-10' type="number" min={ orderProduct.reimbursedQuantity || 0 } max={orderProduct.quantity} onChange={(e) => {updateRejected.current = {...updateRejected.current, [orderProduct.id]: {...updateRejected.current[orderProduct.id], rejectedQuantity: +e.target.value }}} } defaultValue={orderProduct.rejectedQuantity?.toString() || '0'}></input>    
                                : orderProduct.rejectedQuantity
                            }</TableCell>
                            <TableCell>{ orderProduct.reimbursedQuantity }</TableCell>
                            </TableRow>
                        ) 
                    })}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>

            {/* Returns and Replacements */}
            { order._count.return > 0  && (
                <Accordion type="single" collapsible className="w-full p-1 text-xs">
                <AccordionItem value="returns">
                    <AccordionTrigger>
                        <CardTitle>Returns & Replacements</CardTitle>
                    </AccordionTrigger>
                    <AccordionContent>
                    { !returnReplacementDetails.isLoading && returnReplacementDetails.data?.data.map((returnOrder) => (
                        <Card key={returnOrder.id} className="mb-2">
                        <CardHeader>
                            <p className='text-base font-semibold'>{returnOrder.returnType} : {returnOrder.createdAt.toDateString()}</p>
                            <div className="flex flex-col gap-2 mt-5 divide-y">

                                {/** Details of return order  */}
                                <div className="flex flex-row justify-between text-md gap-2"> 
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Return Id:</h3>
                                        <p>{returnOrder.id}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Return Status: </h3>
                                        <p>{returnOrder.returnStatus}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Return Shipment Id: </h3>
                                        <p>{returnOrder.returnShipmentId}</p>
                                    </div>
                                </div>

                                {/** Details of replacement order  */}
                                {returnOrder.ReplacementOrder && <div className="flex flex-row justify-between text-md gap-2 pt-4"> 
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Replacement Id:</h3>
                                        <p>{returnOrder.ReplacementOrder.id}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Replacement Status: </h3>
                                        <p>{returnOrder.ReplacementOrder.status}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm text-gray-500">Replacement Shipment Id: </h3>
                                        <p>{returnOrder.ReplacementOrder.shipmentId}</p>
                                    </div>
                                </div>}

                                {/** Credit note details */}
                                {returnOrder.creditNote && returnOrder.creditNote.map( (creditNote, index) => (
                                    <div className="flex flex-row justify-between text-md gap-2 pt-4" key={index}>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-500">Credit Code</h3>
                                            <p onClick={ () => {redirect(`/creditNotes?orderId=${order.id}`)} } className='text-orange-500 cursor-pointer'>{creditNote.creditCode}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-500">Value</h3>
                                            <p>₹{+creditNote.value}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-sm text-gray-500">Status</h3>
                                            <p> {!creditNote.remainingValue ? 'Redeemed' : 'Active'} </p>
                                        </div>
                                    </div>
                                ))}

                                {/** Actions based on status*/}
                                <div className="flex flex-row justify-end text-md gap-2 pt-4"> 
                                    { returnOrder.returnStatus === 'PENDING' && (
                                        <>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => mutations.cancelReturn.mutate({ returnOrderId: returnOrder.id })}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => mutations.updateReturnOrder.mutate({ returnId: returnOrder.id, returnStatus: "ALLOWED"})}
                                            >
                                                Allow return
                                            </Button>
                                        </>
                                    )}
                                    { (returnOrder.returnStatus === "ALLOWED" || returnOrder.returnStatus == "IN_TRANSIT") && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => mutations.updateReturnOrder.mutate({ returnId: returnOrder.id, returnStatus: "RECEIVED" })}
                                        >
                                            {mutations.updateReturnOrder.isLoading ? "..." : "Mark Received" }
                                        </Button>
                                    )}
                                    { (returnOrder.returnStatus === "RECEIVED" && returnOrder.returnType == "RETURN") && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handlers.handleReturnReviewSubmit(returnOrder.id)}
                                        >
                                            {mutations.updateReturnOrder.isLoading ? "..." : "Submit Return"}
                                        </Button>
                                    )}
                                    { (returnOrder.returnStatus === "RECEIVED" && returnOrder.returnType == "REPLACEMENT") && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => 
                                                handlers.handleReplacementReviewSubmit(returnOrder.ReplacementOrder?.id!)
                                            }
                                        >
                                            Init Replacement
                                        </Button>
                                    )}
                                    { (returnOrder.returnStatus === "REVIEW_DONE" && returnOrder.ReplacementOrder) && (
                                        <>
                                            { returnOrder.ReplacementOrder?.status == "PROCESSING" && 
                                            <>
                                                {/* refund credit mode field will only be present for those item who's CN we have issued, will be an indicator that
                                                    refund has been processed */}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={ async () => { await handlers.handleCNonReplaceableCN(returnOrder.ReplacementOrder?.id!) }}
                                                >
                                                    Issue Credit
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => {}}
                                                >
                                                    Ship Replacement
                                                </Button>
                                            </>
                                            }
                                            { (returnOrder.ReplacementOrder?.status == "PROCESSING" || returnOrder.ReplacementOrder?.status == "SHIPPED") && 
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => {}}
                                                >
                                                    Mark delivered
                                                </Button>
                                            }
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Details</TableHead>
                                    <TableHead>User Reasoning</TableHead>
                                    <TableHead>Admin Review</TableHead>
                                    { returnOrder.returnType == "REPLACEMENT" && <TableHead>Non-Replaced</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnOrder.returnItems.map((item) => (
                                <TableRow key={item.id} className='text-xs'>
                                    <TableCell className='space-y-4 align-top'>
                                        <p className='font-semibold'> P.O Id: {item.orderProductId}</p>
                                        <p>Quantity | {item.quantity}</p>
                                        {returnOrder.returnType == "REPLACEMENT" && <p>Exchange Size | {item.ReplacementItem?.productVariant.size}</p>}
                                    </TableCell>
                                    <TableCell className='space-y-2 divide-y align-top'>
                                        <Image 
                                            src={item.referenceImage!} 
                                            alt={item.id.toString()} 
                                            width={120} 
                                            height={120}
                                        />
                                        <p>{item.returnReason}</p>
                                    </TableCell>
                                    <TableCell className='align-top'>
                                        <p>Reject: </p>
                                        <Input
                                            min={0}
                                            max={item.quantity}
                                            type='number'
                                            defaultValue={item.rejectedQuantity || 0}
                                            className='outline-none'
                                            onChange={(e) => handlers.handleReviewChange(
                                                item.id,
                                                'rejectedQuantity',
                                                parseInt(e.target.value) || 0
                                            )}
                                            disabled={returnOrder.returnStatus !== "RECEIVED"}
                                        />
                                        <Textarea
                                            className='outline-none h-max mt-4 placeholder:text-xs'
                                            onChange={(e) => handlers.handleReviewChange(
                                                item.id,
                                                'rejectReason',
                                                e.target.value
                                            )}
                                            defaultValue={item.rejectReason || ""}
                                            placeholder='Reason to Reject'
                                            disabled={returnOrder.returnStatus !== 'RECEIVED'}
                                        />
                                    </TableCell>
                                    { returnOrder.returnType == "REPLACEMENT" && <TableCell className="space-y-3 align-top ">
                                        <p>Non-Replace Quantity -- </p>
                                        <input
                                            type='number'
                                            disabled={item.ReplacementItem?.nonReplaceAction ? true: false}
                                            min={0}
                                            className='w-full text-center outline-none bg-black text-white p-1 rounded-sm'
                                            max={item.quantity - (item.rejectedQuantity || 0)}
                                            onChange={e => updateNonAvl.current = +e.target.value}
                                            defaultValue={item.ReplacementItem?.nonReplacableQuantity}
                                        />
                                        { item.ReplacementItem?.nonReplaceAction === null && <Button size={"sm"} onClick={async () => { await handlers.handleNonReplace(item.ReplacementItem?.id!, updateNonAvl.current )}}>Update</Button> }
                                        { item.ReplacementItem?.nonReplaceAction && <p>Non-Avl Refund Mode: {item.ReplacementItem?.nonReplaceAction}</p> }
                                    </TableCell>}
                                </TableRow>
                                ))}
                            </TableBody>
                            </Table>

                        </CardContent>                        
                        </Card>
                    ))}
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}

export default OrderDetails