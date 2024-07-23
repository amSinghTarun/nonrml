"use client"

import { useSession } from "next-auth/react";
import React from "react";
import Signin from "../signin";
import { useRecoilState } from "recoil";
import { userAccessibilityOpen as userAccessibilityOpenAtom } from '@/store/atoms/userAccessibility';

export const UserAccessibilityDropdown = () => {
    const { data: session, status: sessionStatus } = useSession();
    const [userAccessibilityOpen, setUserAccessibilityOpen] = useRecoilState(userAccessibilityOpenAtom);
    
    if(!userAccessibilityOpen)
        return (<></>)

    if(!session?.user)
        return (<Signin></Signin>)


    return (
        <> 
            <div className="absolute top-full left-0 bg-teal-400 shadow-lg mt-2 z-50">
                hi 
            </div>
        </>
    )
}