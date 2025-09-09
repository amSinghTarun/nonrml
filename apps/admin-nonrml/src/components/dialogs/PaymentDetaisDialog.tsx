import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CreditCard, ArrowDown } from "lucide-react";
import { RouterOutput } from '@/app/_trpc/client';
import { prismaEnums } from '@nonrml/prisma';

type Payments = NonNullable<NonNullable<RouterOutput["viewer"]["orders"]["getOrder"]["data"]>["Payments"]>

const PaymentDetailsDialog = ({ payment } : {payment: Payments|null}) => {
  if(!payment){
    return <></>
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="h-4 w-4 mr-2" />
          Payment Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment & Refund Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* {payments.map((payment) => ( */}
            <div key={payment.id} className="space-y-4">
              {/* Payment Information */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RZP Payment ID</TableHead>
                      <TableHead>RZP Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{payment.rzpPaymentId || '-'}</TableCell>
                      <TableCell>{payment.rzpOrderId || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          payment.paymentStatus == prismaEnums.PaymentStatus.captured 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>{payment.paymentService}</TableCell>
                      <TableCell>{new Date(payment.createdAt!).toDateString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Refund Cards */}
                {payment.RefundTransactions && payment.RefundTransactions.length > 0 && (
                  <div className="p-4 border-t bg-slate-50">
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                      <ArrowDown size={16} />
                      <span>Refunds</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {payment.RefundTransactions.map((refund) => (
                        <Card key={refund.id} className="bg-white">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">Refund ID</p>
                                <p className="text-sm text-slate-600">{refund.rzpRefundId || '-'}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs`}>
                                {refund.rzpRefundStatus}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium">Amount</p>
                                <p className="text-slate-600">₹{refund.bankRefundValue}</p>
                              </div>
                              <div>
                                <p className="font-medium">Trigger</p>
                                <p className="text-slate-600">{refund.trigger}</p>
                              </div>
                              <div>
                                <p className="font-medium">Credit Note</p>
                                <p className="text-slate-600">{refund.creditNoteId || '-'}</p>
                              </div>
                              {refund.CreditNotes?.id && <div>
                                <p className="font-medium">Credit Amount</p>
                                <p className="text-slate-600">{+refund.CreditNotes.value}</p>
                              </div>}
                              <div className="col-span-2">
                                <p className="font-medium">Created On</p>
                                <p className="text-slate-600">{new Date(refund.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          {/* ))} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;