import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import React from "react";

interface QuantityChangeDialogProps {
    cancelPurchase: () => Promise<void>,
}

const CancelOrderDialog : React.FC<QuantityChangeDialogProps> = (props) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild >
                <button className="text-xs pr-2 text-neutral-600 hover:underline transition-all duration-200">CANCEL ORDER</button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white border-0 rounded-sm w-72 sm:w-96 ">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-md sm:text-xl text-neutral-600">CANCEL ORDER.</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs sm:text-sm pb-3 text-neutral-500">
                        {`Cancelling this order means you can miss out on these items. Are you sure?`}
                    </AlertDialogDescription>
                    <AlertDialogAction className="text-xs rounded-sm shadow-none border hover:bg-transparent border-neutral-400 text-neutral-500 hover:text-neutral-900 bg-transparent  sm:text-sm font-normal" onClick={props.cancelPurchase}>CANCEL ANYWAY</AlertDialogAction> 
                    <AlertDialogCancel className="text-xs rounded-sm sm:text-sm font-normal bg-neutral-800 text-white hover:underline hover:bg-neutral-900 border-none hover:text-white">DON'T CANCEL</AlertDialogCancel> 
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CancelOrderDialog;