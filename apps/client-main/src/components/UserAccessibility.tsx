"use client"

import { useRecoilState } from 'recoil';
import { UserAccessibilityDropdown } from './dropdowns/UserAccessibilityButton'
import { useSession} from 'next-auth/react';
import React from 'react';
import Signin from './Signin';
import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";

export const UserAccessibility = () => {
    const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom)
    const { data: session } = useSession();

    return (
        <>
        {
            selectedUtil == "USER_ACCESSIBILITY" ? 
            session?.user ? 
                <UserAccessibilityDropdown></UserAccessibilityDropdown> : <Signin></Signin>
            : <></>
        }
        </>
    )
};