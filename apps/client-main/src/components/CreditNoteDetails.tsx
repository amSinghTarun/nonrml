import { RouterOutput } from "@/app/_trpc/client"
import React from "react"

const convertStringToINR = (currencyString: number) => {
    let INR = new Intl.NumberFormat();
    return `INR ${INR.format(currencyString)}.00`;
}

type creditNoteDetails = RouterOutput["viewer"]["creditNotes"]["getCreditNoteDetails"]["data"]

interface CreditNoteDetailsProps {
    creditNoteDetails: creditNoteDetails
}
export const CreditNoteDetails : React.FC<CreditNoteDetailsProps> = ({creditNoteDetails}) => {
    return (
        <div className=" h-full w-full text-neutral-600 ">
             <div className="flex flex-col justify-between space-y-1 text-xs p-3 ">
                    <div className="flex justify-between">
                        <p className="text-neutral-600"> {creditNoteDetails.creditCode} </p>
                        <p className="text-neutral-600"> {convertStringToINR(+creditNoteDetails.value)} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-neutral-500"> Remaining Value </p>
                        <p className="text-neutral-600"> {convertStringToINR(+creditNoteDetails.remainingValue)} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-neutral-500"> Created at </p>
                        <p className="text-neutral-600"> {creditNoteDetails.createdAt.toDateString()} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-neutral-500"> Expire at </p>
                        <p className="text-neutral-600"> {creditNoteDetails.expiryDate.toDateString()} </p>
                    </div>
            </div>
            <h2 className="pb-2 pt-4 text-xs text-neutral-500 font-medium">CREDIT NOTE TRANSACTION(s)</h2>
            <div className="space-y-2 flex justify-center">
            {
                creditNoteDetails.creditNotesPartialUseTransactions.length ? creditNoteDetails.creditNotesPartialUseTransactions.map( (transaction, index) => {
                    return (
                        <div className="flex w-full flex-col justify-between space-y-1 text-xs relative p-3 shadow-sm shadow-neutral-200 rounded-md">
                            <div className="flex justify-between">
                                <p className="font-light"> Value Utilized: </p>
                                <p> {convertStringToINR(Number(transaction.valueUtilised))} </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-light"> Transaction Date : </p>
                                <p> {transaction.createdAt.toDateString()} </p>
                            </div>
                        </div>
                )}) : <p className="text-xs border mt-6 border-neutral-300 py-3 px-6 w-fit text-neutral-400 rounded-sm">No Transactions yet</p>
            }
            </div>
        </div>
    )
}


// HDNOKE-83256