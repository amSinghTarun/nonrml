"use client"

import { useResetRecoilState } from 'recoil';
import { appbarOpenUtil as appbarOpenUtilAtom } from "../store/atoms";

export const NavbarStateControlProvider = ({ children }: { children: React.ReactNode }) => {
    const resetRecoilOnReload = useResetRecoilState(appbarOpenUtilAtom);
    //console.log("THE RECOIL STATE ");
    resetRecoilOnReload();
    return (
        <>
            {children}
        </>
    )
};