"use client"

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { RouterOutput } from "@/app/_trpc/client";

type Transaction = {
  id: number;
  creditNoteId: number;
  valueUtilised: number;
  orderId: string;
  createdAt: Date;
  updatedAt: Date;
};

type CreditNoteTransactionsProps = {
  transactions: RouterOutput["viewer"]["creditNotes"]["getCreditNotes"]["data"][number]["creditNotesPartialUseTransactions"];
  creditNoteId: string;
};

export function CreditNoteTransactions({
  transactions,
  creditNoteId,
}: CreditNoteTransactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-stone-600 focus:bg-stone-600">
          View Transactions
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Credit Note {creditNoteId} - Transaction History
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No transactions found for this credit note.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Value Utilized</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell className="font-medium">
                      {transaction.orderId}
                    </TableCell>
                    <TableCell>₹{+transaction.valueUtilised}</TableCell>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "PPpp")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaction.updatedAt), "PPpp")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4">
            <div className="flex justify-end items-center py-2 px-4 rounded-lg">
              <span className="font-bold">
                <span className="font-medium">Total Value Utilized : </span>
                ₹ { transactions.reduce( (sum, transaction) => sum + Number(transaction.valueUtilised), 0 ).toFixed(2) }
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}