"use client"

import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { usePathname } from 'next/navigation';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useStore } from 'zustand';
import { RiShoppingBag3Fill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx"

const CartButton = () => {
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
    const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);
    
    const pathname = usePathname();

    // to hide the cart at the checkout page so that the user can't edit it there.
    if(pathname.includes("checkout"))
        return (<></>)

    const handleOnClick = () => {
        appbarUtil != "CART" ? setAppbarUtil("CART") : setAppbarUtil("")
    }
    return (
        <div 
            className=' cursor-pointer w-auto h-full content-center' 
            onClick={handleOnClick}>
            {
                appbarUtil == "CART" 
                ? <RxCross2  size={24}/>
                : <RiShoppingBag3Fill size={24} /> 
            }
        </div>
    )
}

export default CartButton;
// sx={{ width: 'auto', height: '90%', color:"black" }}