"use client"

import { useRecoilState } from "recoil";
import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import BlurOffIcon from '@mui/icons-material/BlurOff';
import BlurOnIcon from '@mui/icons-material/BlurOn';

export const MenuButton = () => {
    const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
        return (
            <div 
                className=' hover:cursor-pointer w-auto h-full' 
                onClick={()=>{
                    selectedUtil != "SIDEBAR" ? setSelectedUtil("SIDEBAR") : setSelectedUtil("")
                }}
            >
                { selectedUtil != "SIDEBAR" ? <BlurOnIcon sx={{ width: 'auto', height: '100%', color:"black" }} /> : <BlurOffIcon sx={{width:"auto", height:"100%", color:"black"}}/>}
            </div>
        )
};