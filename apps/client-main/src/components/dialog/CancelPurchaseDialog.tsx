import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  
import { useRouter } from "next/navigation";
import CancelIcon from '@mui/icons-material/Cancel';

const CanclePurchaseDialog = () => {
    const router = useRouter();
    return (
        <AlertDialog>
            <AlertDialogTrigger className="fixed hover:cursor-pointer rounded-full font-medium p-1 text-xs -right-3 -top-3">
                <CancelIcon className="p-0"></CancelIcon>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/60 border-0 rounded-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl">Have you thought it through?</AlertDialogTitle>
                    <AlertDialogDescription className="font-lg font-medium pb-3 text-black">
                        {`The product is in high demand. `}
                        <span className=" text-red-600">
                            Buy before it goes OUT OF STOCK.
                        </span>
                    </AlertDialogDescription>
                    <AlertDialogCancel>CONTINUE PURCHASE</AlertDialogCancel> 
                    <AlertDialogAction onClick={() => router.back()}>CANCEL PURCHASE</AlertDialogAction> 
                </AlertDialogHeader>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default CanclePurchaseDialog;