"use client"

import { useRecoilState } from 'recoil';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { useSetAppbarUtilStore } from "@/store/atoms";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useStore } from 'zustand';
import { useSession } from 'next-auth/react';

export const UserButton = () => {
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
    const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);

    const { data: session } = useSession(); 

    const handleOnClick = () => {
        appbarUtil != "USER_ACCESSIBILITY" ? setAppbarUtil("USER_ACCESSIBILITY") : setAppbarUtil("");
    }
    
    return (
        <div 
            className= {`cursor-pointer w-auto h-full ${session?.user && "hidden"}`}
            onClick={handleOnClick}>
            {
                appbarUtil == "USER_ACCESSIBILITY" ?
                    <HighlightOffIcon sx={{ width: '80%', height: '90%', color:"black" }} />
                :
                    <AccessibilityNewIcon sx={{ width: 'auto', height: '90%', color:"black" }} />    
            }
        </div>
    )
};
// RET-10B20250130