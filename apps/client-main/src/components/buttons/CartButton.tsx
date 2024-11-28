"use client"

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useRecoilState } from 'recoil';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
// import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";

const CartButton = () => {
    // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
    const handleOnClick = () => {
        appbarUtil != "CART" ? setAppbarUtil("CART") : setAppbarUtil("")
    }
    return (
        <div 
            className=' hover:cursor-pointer w-auto h-full' 
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