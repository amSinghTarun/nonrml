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
            {/* <AlertDialogTrigger className="fixed hover:cursor-pointer rounded-full font-medium p-1 text-xs -right-3 -top-3">
                <CancelIcon className="p-0"></CancelIcon>
            </AlertDialogTrigger> */}
            <AlertDialogContent className="bg-white/60 border-0 rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl text-red-500">QUANTITY CHANGE UPDATE</AlertDialogTitle>
                    <AlertDialogDescription className="font-lg font-medium pb-3 text-black">
                        {`Some items in your cart were less then required quantity so we updated it for you.`}
                    </AlertDialogDescription>
                    <AlertDialogCancel onClick={props.continuePurchase}>ALRIGHT! LET'S CONTINUE</AlertDialogCancel> 
                    <AlertDialogAction onClick={props.cancelPurchase}>VIEW CART</AlertDialogAction> 
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default QuantityChangeDialog;