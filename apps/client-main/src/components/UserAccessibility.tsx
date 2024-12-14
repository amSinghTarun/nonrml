"use client"

import { UserAccessibilityDropdown } from './dropdowns/UserAccessibilityButton'
import { useSession} from 'next-auth/react';
import React from 'react';
import Signin from './Signin';
import { useSetAppbarUtilStore } from "@/store/atoms";
import { useStore } from 'zustand';

export const UserAccessibility = () => {
    const appbarUtil = useStore(useSetAppbarUtilStore, (state) => state.appbarUtil);

    const { data: session } = useSession();

    return (
        <>
        {
            appbarUtil == "USER_ACCESSIBILITY" ? 
            session?.user ? 
                <UserAccessibilityDropdown></UserAccessibilityDropdown> : <Signin></Signin>
            : <></>
        }
        </>
    )
};