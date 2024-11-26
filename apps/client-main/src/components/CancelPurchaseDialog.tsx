import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation";
import CancelIcon from '@mui/icons-material/Cancel';

const CanclePurchaseDialog = () => {
    const router = useRouter();
    return (
        <Dialog>
            <DialogTrigger className="fixed hover:cursor-pointer rounded-full font-medium p-1 text-xs -right-3 -top-3">
                <CancelIcon className="p-0"></CancelIcon>
            </DialogTrigger>
            <DialogContent className="bg-white border-0">
                <DialogHeader>
                    <DialogTitle className="text-xl">Have you thought it through?</DialogTitle>
                    <DialogDescription className="font-lg font-medium pb-3 text-black">
                        {`The product is in high demand. `}
                        <text className=" text-red-600">
                            Buy before it goes OUT OF STOCK.
                        </text>
                    </DialogDescription>
                    <DialogDescription className=" flex flex-row justify-center items-center gap-4">
                        <div className="basis-1/2 text-center py-2 text-white bg-black rounded-xl text-md">
                            <DialogClose className="">CONTINUE PURCHASE</DialogClose> 
                        </div>
                        <div className="basis-1/2 text-center py-2 text-white bg-red-600 rounded-xl text-md">
                            <button onClick={() => router.back()}>CANCEL PURCHASE</button> 
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default CanclePurchaseDialog;