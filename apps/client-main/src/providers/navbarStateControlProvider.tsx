"use client"

import { useSetAppbarUtilStore } from "@/store/atoms";
import { useStore } from "zustand";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function NavbarStateControlProvider() {
    const pathname = usePathname();
    const reset = useStore(useSetAppbarUtilStore, (state) => state.reset);
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);

    useEffect(() => {
        console.log(`Route changed to: ${pathname}`);
        appbarUtil !=  "" && reset()
    }, [pathname]);

    return <></>;
}