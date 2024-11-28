"use client"

import { Checkout } from "@/components/Checkout"
import React from "react";
import { useRecoilState } from "recoil";
import { useSession } from "next-auth/react"
// import { appbarOpenUtil as appbarOpenUtilAtom } from "@/store/atoms";
import { useSetAppbarUtilStore } from "@/store/atoms";

const CheckoutPage = ({params}: {params: {buyOption: string}}) => {
    // const [ selectedUtil, setSelectedUtil] = useRecoilState(appbarOpenUtilAtom);
    const { appbarUtil, setAppbarUtil } = useSetAppbarUtilStore()
    useSession({
        required: true,
        onUnauthenticated() {
            setAppbarUtil("USER_ACCESSIBILITY");
        },
    })
    return (
        <>
            <section className=" flex flex-row w-screen h-screen text-black justify-center items-center ">
                <Checkout className="h-[80%] w-[90%] xl:w-[50%]" buyOption={params.buyOption} ></Checkout> 
            </section>
        </>

    )
}

export default CheckoutPage;

