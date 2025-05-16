import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { RouterInput, RouterOutput } from "@/app/_trpc/client";

type CreditNote = RouterOutput["viewer"]["creditNotes"]["getCreditNotes"]["data"][number];
type editCNInput = RouterInput["viewer"]["creditNotes"]["editCreditNote"];

export function CreditNoteEditDialog({note, onSave}: {note: CreditNote, onSave: (id: number, data: Omit<editCNInput, "id"> ) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<editCNInput, "id">>({
    value: +note.value,
    expiryDate: new Date(note.expiryDate),
    // remainingValue: note.remainingValue
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(note.id, formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left px-2 py-1.5 text-sm hover:bg-stone-600 focus:bg-stone-600">
          Edit Details
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Credit Note: {note.creditCode}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: +e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate?.toISOString().split('T')[0]}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: new Date(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remainingValue">Remaining Value</Label>
            <Input
              id="remainingValue"
              type="number"
              value={formData.remainingValue}
              onChange={(e) =>
                setFormData({ ...formData, remainingValue: +e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const calculateRemainingValue = (
    originalValue: number | string,
    transactions: { valueUtilised: number }[]
  ) => {
    const total = transactions.reduce(
      (sum, transaction) => sum + Number(transaction.valueUtilised),
      0
    );
    return Number(originalValue) - total;
};