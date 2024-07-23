"use client"

import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { cartOpen as cartOpenAtom } from '@/store/atoms/cart';
import { useRecoilState } from 'recoil';
import { userAccessibilityOpen as userAccessibilityOpenAtom } from '@/store/atoms/userAccessibility';
import { sidebarOpen as sidebarOpenAtom } from "@/store/atoms";

const CartButton = () => {
    const [cartOpen, setCartOpen] = useRecoilState(cartOpenAtom);
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenAtom);
    const [userAccessibilityOpen, setUserAccessibilityOpen] = useRecoilState(userAccessibilityOpenAtom);

    return (
        <div className='static'>
            <div 
                className=' hover:cursor-pointer' 
                onClick={()=>{
                    setSidebarOpen(false);
                    setUserAccessibilityOpen(false);
                    setCartOpen(!cartOpen);
                }}
            >
                <ShoppingBagIcon sx={{fontSize: {xs:25, md:40, sm:32} }} />
                <div className='absolute'>
                    {cartOpen ? <div className='mt-20'>open</div> : <></>}
                </div>
            </div>
        </div>
    )
}

export default CartButton;