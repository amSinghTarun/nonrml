"use client"

import React from 'react';
import { trpc } from '@/app/_trpc/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const RefundDetailsDialog = ({ paymentId, open, onOpenChange }: { 
    paymentId: string, 
    open: boolean, 
    onOpenChange: (open: boolean) => void 
  }) => {
    const RefundTransactions = trpc.viewer.payment.getPaymentRefundDetails.useQuery(
      { rzpPaymentId: paymentId },
    );
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          
          {RefundTransactions.isLoading && <div className="p-4 text-center">Loading details...</div>}
          
          {RefundTransactions.data?.data && (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                {/* Refund Transactions */}
                <AccordionItem value="refunds">
                  <AccordionTrigger className="text-lg font-semibold">
                    Refund Transactions ({RefundTransactions.data?.data.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    {RefundTransactions.data?.data.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Refund ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {RefundTransactions.data?.data.map((refund) => (
                            <TableRow key={refund.id}>
                              <TableCell>{refund.rzpRefundId || '-'}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  refund.rzpRefundStatus === 'processed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {refund.rzpRefundStatus}
                                </span>
                              </TableCell>
                              <TableCell>₹{refund.bankRefundValue}</TableCell>
                              <TableCell>{refund.createdAt.toDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground py-2">No refund transactions found</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
  
                {/* Credit Notes */}
                <AccordionItem value="credits">
                  <AccordionTrigger className="text-lg font-semibold">
                    Credit Notes
                  </AccordionTrigger>
                  <AccordionContent>
                    {RefundTransactions.data?.data.some(rt => rt.CreditNotes) ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Credit Code</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiry Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {RefundTransactions.data?.data
                            .filter(rt => rt.CreditNotes)
                            .map((refund) => (
                              <TableRow key={refund.CreditNotes?.id}>
                                <TableCell>{refund.CreditNotes?.creditCode}</TableCell>
                                <TableCell>₹{Number(refund.CreditNotes?.value).toFixed(2)}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    !refund.CreditNotes?.remainingValue 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {!refund.CreditNotes?.remainingValue ? 'Redeemed' : 'Active'}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {refund.CreditNotes?.expiryDate.toDateString()}
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground py-2">No credit notes found</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
  