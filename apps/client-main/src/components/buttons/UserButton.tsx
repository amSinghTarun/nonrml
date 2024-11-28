"use client"

import { useRecoilState } from 'recoil';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
// import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export const UserButton = () => {
    // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore();
    const handleOnClick = () => {
        appbarUtil != "USER_ACCESSIBILITY" ? setAppbarUtil("USER_ACCESSIBILITY") : setAppbarUtil("")
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
