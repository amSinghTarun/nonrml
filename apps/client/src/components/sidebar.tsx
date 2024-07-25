"use client"

import { useRecoilState } from "recoil";
import { sidebarOpen as sidebarOpenAtom } from "@/store/atoms";
import { Searchbar } from "./searchbar"
import CallIcon from '@mui/icons-material/Call';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export const Sidebar = () => {
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarOpenAtom);
    
    if(!sidebarOpen)
        return (<></>);

    return (
            <div  className=" fixed h-screen w-screen bg-black/15 backdrop-blur-lg z-40  left-0 ">
            <div className=" bg-gradient-to-br from-white/45 shadow-2xl shadow-black flex h-full flex-col w-80 sm:w-[40%] lg:w-[25%] pt-20 lg:pt-24 md:pt-24 min-h-screen justify-between">
                <div className="flex-col flex w-[100%] items-center gap-y-5">
                    <Searchbar ></Searchbar> 
                    {/* <div className="text-white">SHOP</div> */}
                </div>
                <div className="min-h-24 flex flex-row divide-x divide-dotted items-center text-center pb-5">
                    <div className="text-white flex-1 flex flex-col hover:cursor-pointer">
                        <div ><CallIcon fontSize="large"></CallIcon></div>
                        <div className="text-xs">Contact us</div>
                    </div>
                    <div className="text-white flex-1 flex flex-col hover:cursor-pointer">
                        <div><InstagramIcon fontSize="large" /></div>
                        <div className="text-xs">Instagram</div>
                    </div>
                    <div className="text-white flex-1 flex flex-col hover:cursor-pointer">
                        <div><LocalShippingIcon fontSize="large" /></div>
                        <div className="text-xs">Track order</div>
                    </div>
                </div>
            </div>
        </div>
    );
};