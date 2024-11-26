"use client"

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useRecoilState } from 'recoil';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";

const CartButton = () => {
    const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const handleOnClick = () => {
        selectedUtil != "CART" ? setSelectedUtil("CART") : setSelectedUtil("")
    }
    return (
        <div 
            className=' hover:cursor-pointer w-auto h-full' 
            onClick={handleOnClick}>
            {
                selectedUtil == "CART" ?
                    <HighlightOffIcon sx={{ width: '80%', height: '100%', color:"black" }} />
                :
                    <ShoppingBagIcon sx={{ width: 'auto', height: '100%', color:"black" }} />    
            }
        </div>
    )
}

export default CartButton;