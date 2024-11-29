"use client"

import { useResetRecoilState } from 'recoil';
// import { appbarOpenUtil as appbarOpenUtilAtom } from "../store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";

export const NavbarStateControlProvider = ({ children }: { children: React.ReactNode }) => {
    // const resetRecoilOnReload = useResetRecoilState(appbarOpenUtilAtom);
    // const { reset } = useSetAppbarUtilStore();
    //console.log("THE RECOIL STATE ");
    // reset();
    return (
        <>
            {children}
        </>
    )
};