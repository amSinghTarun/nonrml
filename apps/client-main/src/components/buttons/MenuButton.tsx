"use client"

import { useSetAppbarUtilStore } from "@/store/atoms";
import BlurOffIcon from '@mui/icons-material/BlurOff';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { useStore } from "zustand";
import { TbMenu4 } from "react-icons/tb";
import { TbMenu3 } from "react-icons/tb";

export const MenuButton = () => {
    // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
    const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);

    return (
        <div 
            className=' cursor-pointer w-auto h-full content-center' 
            onClick={()=>{
                appbarUtil != "SIDEBAR" ? setAppbarUtil("SIDEBAR") : setAppbarUtil("")
            }}
        >
            { appbarUtil != "SIDEBAR" ? 
            <TbMenu4 size={24} /> : 
            <TbMenu3 size={24} />}
        </div>
    )
};