"use client"

import { useRecoilState } from "recoil";
import { sidebarOpen as sidebarOpenAtom } from "@/store/atoms";
import BlurOffIcon from '@mui/icons-material/BlurOff';
import { cartOpen as cartOpenAtom } from '@/store/atoms/cart';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { userAccessibilityOpen as userAccessibilityOpenAtom } from '@/store/atoms/userAccessibility';
import { Sidebar } from "../sidebar";

export const MenuButton = () => {
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenAtom);
    const [userAccessibilityOpen, setUserAccessibilityOpen] = useRecoilState(userAccessibilityOpenAtom);
    const [cartOpen, setCartOpen] = useRecoilState(cartOpenAtom);
        return (
            <div 
                className=' hover:cursor-pointer' 
                onClick={()=>{
                    setSidebarOpen(!sidebarOpen);
                    setUserAccessibilityOpen(false);
                    setCartOpen(false);
                }}
            >
                { !sidebarOpen ? <BlurOnIcon sx={{fontSize: {xs:25, sm:32, md:40} }} /> : <BlurOffIcon sx={{fontSize: {xs:25, sm:32, md:40} }} />}
            </div>
        )
};