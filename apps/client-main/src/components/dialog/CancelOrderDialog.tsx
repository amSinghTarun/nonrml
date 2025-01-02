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
    const router = useRouter();
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild >
                <button className=" -bottom-1 rounded-full px-4 py-2 bg-white text-black">CANCEL</button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/60 border-0 rounded-xl backdrop-blur-sm w-72 sm:w-96 ">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-md sm:text-xl text-red-500">CANCEL ORDER.</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm sm:text-md  font-medium pb-3 text-black">
                        {`Cancelling this order means you can miss out on these items. Are you sure?`}
                    </AlertDialogDescription>
                    <AlertDialogCancel className="text-xs sm:text-md">DON'T CANCEL</AlertDialogCancel> 
                    <AlertDialogAction className="text-xs sm:text-md" onClick={props.cancelPurchase}>CANCEL ANYWAY</AlertDialogAction> 
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CancelOrderDialog;