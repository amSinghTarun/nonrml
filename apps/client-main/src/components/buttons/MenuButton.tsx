"use client"

import { useSetAppbarUtilStore } from "@/store/atoms";
import BlurOffIcon from '@mui/icons-material/BlurOff';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useStore } from "zustand";

export const MenuButton = () => {
    // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
    const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);

    return (
        <div 
            className=' hover:cursor-pointer w-auto h-full' 
            onClick={()=>{
                appbarUtil != "SIDEBAR" ? setAppbarUtil("SIDEBAR") : setAppbarUtil("")
            }}
        >
            { appbarUtil != "SIDEBAR" ? <BlurOnIcon sx={{ width: 'auto', height: '100%', color:"black" }} /> : <BlurOffIcon sx={{width:"auto", height:"100%", color:"black"}}/>}
        </div>
    )
};