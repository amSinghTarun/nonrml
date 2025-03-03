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
        <div className=" h-full w-full ">
             <div className="flex flex-col justify-between space-y-1 text-xs relative p-3 ">
                    <div className="flex justify-between">
                        <p className="font-light"> Credit Code : </p>
                        <p> {creditNoteDetails.creditCode} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-light"> Value : </p>
                        <p> {convertStringToINR(+creditNoteDetails.value)} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-light"> Created at : </p>
                        <p> {creditNoteDetails.createdAt.toDateString()} </p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-light"> Expire at : </p>
                        <p> {creditNoteDetails.expiryDate.toDateString()} </p>
                    </div>
            </div>
            <h2 className="pb-2 pt-4 text-md font-medium">CREDIT NOTE TRANSACTION(s)</h2>
            <div className="space-y-2">
            {
                creditNoteDetails.creditNotesPartialUseTransactions.map( (transaction, index) => {
                    return (
                        <div className="flex flex-col justify-between space-y-1 text-xs relative p-3">
                            <div className="flex justify-between">
                                <p className="font-light"> Value Utilized: </p>
                                <p> {convertStringToINR(Number(transaction.valueUtilised))} </p>
                            </div>
                            <div className="flex justify-between">
                                <p className="font-light"> Transaction Date : </p>
                                <p> {transaction.createdAt.toDateString()} </p>
                            </div>
                        </div>
                )})
            }
            </div>
        </div>
    )
}


// HDNOKE-83256