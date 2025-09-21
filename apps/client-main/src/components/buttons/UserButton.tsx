"use client"

import { useStore } from 'zustand';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

export const UserButton = () => {
  const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);
  const setAppbarUtil = useStore(useSetAppbarUtilStore, (state) => state.setAppbarUtil);
  const { data: session } = useSession(); 
  const router = useRouter();
  const pathname = usePathname();

  const handleOnClick = () => {
    // if modal is open and user is on /orders without a session → redirect to collections
    if (appbarUtil === "USER_ACCESSIBILITY") {
      if (!session && pathname?.startsWith("/orders")) {
        router.replace("/collections");
        return;
      }
      setAppbarUtil("");
    } else {
      setAppbarUtil("USER_ACCESSIBILITY");
    }
  };

  return (
    <div 
      className={`cursor-pointer w-auto h-full content-center ${session?.user && "hidden"}`}
      onClick={handleOnClick}
    >
      {appbarUtil === "USER_ACCESSIBILITY" ? (
        <RxCross2 size={24}/>
      ) : (
        <AccessibilityNewIcon sx={{ width: 'auto', height: '90%', color:"black" }} />    
      )}
    </div>
  );
};
