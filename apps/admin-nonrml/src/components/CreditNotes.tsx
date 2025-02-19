import React from "react";
import { RouterInput, RouterOutput, trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useRouter } from "next/navigation";
import { calculateRemainingValue, CreditNoteEditDialog } from "./CreditNote";
import { CreditNoteTransactions } from "./CreditNoteTransactions";

type CreditNotes = UseTRPCQueryResult<RouterOutput["viewer"]["creditNotes"]["getCreditNotes"], unknown>;
type editCNInput = RouterInput["viewer"]["creditNotes"]["editCreditNote"];

export const CreditNotes = ({ creditNotes }: { creditNotes: CreditNotes }) => {
  const router = useRouter();
  const utils = trpc.useContext();

  const mutations = {
    editCN: trpc.viewer.creditNotes.editCreditNote.useMutation({
      onSuccess: () => creditNotes.refetch()
    }),
    deleteCN: trpc.viewer.creditNotes.deleteCreditNote.useMutation({
      onSuccess: () => creditNotes.refetch()
    })
  }

  const handlers = {
    handleSave: async (id: number, formData: Omit<editCNInput, "id">) => {
      try {
        if(Object.keys(formData).length == 0)
          throw "Empty Update Payload"

        await mutations.editCN.mutateAsync({id: id, ...formData})

      } catch (error) {
        console.error("Failed to update credit note:", error);
      }
    },
    handleCNDelete: async (id: number) => {
      try {
        await mutations.deleteCN.mutateAsync({id: id})
      } catch (error) {
        console.error("Failed to update credit note:", error);
      }
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-orange-400 text-white cursor-pointer">
              ID
            </TableHead>
            <TableHead>Credit Code</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Return Order ID</TableHead>
            <TableHead>User Id</TableHead>
            <TableHead>{`From -> To`}</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remaining Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditNotes.data?.data.map((note) => {
            const remainingValue = calculateRemainingValue(
              +note.value,
              note.creditNotesPartialUseTransactions
            );
            return (
              <TableRow key={note.id}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TableCell className="hover:bg-orange-400 hover:text-white cursor-pointer">
                      {note.id}
                    </TableCell>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-stone-700 text-white">
                    <CreditNoteEditDialog note={note} onSave={handlers.handleSave} />
                    <CreditNoteTransactions 
                      transactions={note.creditNotesPartialUseTransactions}
                      creditNoteId={note.creditCode}
                    />
                    <DropdownMenuItem
                      onClick={async () => await handlers.handleCNDelete(note.id)}
                    >
                      Delete CN
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <TableCell>{note.creditCode}</TableCell>
                <TableCell>{note.value.toString()}</TableCell>
                <TableCell>{note.returnOrderId}</TableCell>
                <TableCell>{note.userId}</TableCell>
                <TableCell>
                  {`${new Date(note.createdAt).toLocaleDateString('en-GB')} -> ${new Date(note.expiryDate).toLocaleDateString("en-GB")}`}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      note.redeemed
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {note.redeemed ? "Redeemed" : "Active"}
                  </span>
                </TableCell>
                <TableCell>{remainingValue.toString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};