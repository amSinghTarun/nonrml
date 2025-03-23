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
    open: boolean,
    cancelPurchase: () => void,
    continuePurchase: () => void
}

const QuantityChangeDialog : React.FC<QuantityChangeDialogProps> = (props) => {
    const router = useRouter();
    return (
        <AlertDialog open={props.open}>
        <AlertDialogContent className="bg-white border-0 rounded-sm w-72 sm:w-96 ">
            <AlertDialogHeader>
                <AlertDialogTitle className="text-md sm:text-xl text-neutral-600">QUANTITY CHANGE UPDATE</AlertDialogTitle>
                <AlertDialogDescription className="text-xs sm:text-sm pb-3 text-neutral-500">
                    {`Some items in your cart were more then available quantity so we updated it for you.`}
                </AlertDialogDescription>
                <AlertDialogAction className="text-xs rounded-sm shadow-none border hover:bg-transparent border-neutral-400 text-neutral-500 hover:text-neutral-900 bg-transparent  sm:text-sm font-normal" onClick={props.cancelPurchase}>REVIEW YOURSELF</AlertDialogAction> 
                <AlertDialogCancel className="text-xs rounded-sm sm:text-sm font-normal bg-neutral-800 text-white hover:underline hover:bg-neutral-900 border-none hover:text-white" onClick={props.continuePurchase}>ALRIGHT! LET'S CONTINUE</AlertDialogCancel> 
            </AlertDialogHeader>
        </AlertDialogContent>
        </AlertDialog>

    )
}

export default QuantityChangeDialog;