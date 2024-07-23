"use client"

import { useRecoilState } from 'recoil';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { sidebarOpen as sidebarOpenAtom } from "@/store/atoms";
import { userAccessibilityOpen as userAccessibilityOpenAtom } from '@/store/atoms/userAccessibility';
import { UserAccessibilityDropdown } from '../dropdowns/userAccessibility';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation'
import { cartOpen as cartOpenAtom } from '@/store/atoms/cart';
import Signin from '../signin';

export const UserButton = () => {
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenAtom);
    const [userAccessibilityOpen, setUserAccessibilityOpen] = useRecoilState(userAccessibilityOpenAtom);
    const [cartOpen, setCartOpen] = useRecoilState(cartOpenAtom);


    return (
                <div className="hover:cursor-pointer" onClick={()=>{
                    setSidebarOpen(false);
                    setUserAccessibilityOpen(!userAccessibilityOpen) 
                    setCartOpen(false);
                }}>
                    <AccessibilityNewIcon sx={{fontSize: {xs:25, sm:32, md:40} }} />
                </div>
    )
};