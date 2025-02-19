"use client"

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useRecoilState } from 'recoil';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { usePathname } from 'next/navigation';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useStore } from 'zustand';

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
            className=' cursor-pointer w-auto h-full' 
            onClick={handleOnClick}>
            {
                appbarUtil == "CART" ?
                    <HighlightOffIcon sx={{ width: '80%', height: '100%', color:"black" }} />
                :
                    <ShoppingBagIcon sx={{ width: 'auto', height: '100%', color:"black" }} />    
            }
        </div>
    )
}

export default CartButton;