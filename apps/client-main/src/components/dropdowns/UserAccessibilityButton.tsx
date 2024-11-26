import { signOut } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";
import { DropdownButton, DropdownMenu } from "../ui/dropdown";
import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";

export const UserAccessibilityDropdown = () => {
    const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);

    if(selectedUtil != "USER_ACCESSIBILITY")
        return (<></>)

    const dropdownMenuContent : {href?: string, display: string, onClickFnc?: ()=> void }[] = [
        {
            href: "/order/all",
            display: "Orders"
        }, 
        {
            href: "/creditNote",
            display: "Credit Note"
        },
        {
            onClickFnc: () => { signOut() },
            display: "Sign out"
        }
    ]

    
    return (
        <DropdownMenu>
            {
                dropdownMenuContent.map(({display, href, onClickFnc}, index) => {
                    return <DropdownButton display={display} href={href} onClick={onClickFnc} key={index} />
                })
            }
        </DropdownMenu>
    )
}