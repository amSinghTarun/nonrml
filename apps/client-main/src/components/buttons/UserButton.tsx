"use client"

import { useRecoilState } from 'recoil';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { useSetAppbarUtilStore } from "@/store/atoms";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useStore } from 'zustand';

export const UserButton = () => {
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
    const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);


    const handleOnClick = () => {
        appbarUtil != "USER_ACCESSIBILITY" ? setAppbarUtil("USER_ACCESSIBILITY") : setAppbarUtil("");
    }
    
    return (
        <div 
            className=' hover:cursor-pointer w-auto h-full' 
            onClick={handleOnClick}>
            {
                appbarUtil == "USER_ACCESSIBILITY" ?
                    <HighlightOffIcon sx={{ width: '80%', height: '100%', color:"black" }} />
                :
                    <AccessibilityNewIcon sx={{ width: 'auto', height: '100%', color:"black" }} />    
            }
        </div>
    )
};
