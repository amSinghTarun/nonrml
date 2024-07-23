"use client"

import { Textfield } from './textField';
import Button from '@mui/material/Button';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import logo from "../images/logo.png"
const Signin = () => {
    return (
        <div className="fixed h-screen w-screen  bg-white/25  backdrop-blur-sm flex flex-col items-center z-20">
            <div className="  flex-1 lg:w-[40%] w-[70%] justify-center content-center">
                <div className="bg-black text-white  rounded-3xl flex flex-col gap-y-7 py-8 px-6">
                    <div className=' text-center text-5xl'>
                        Sign in.
                    </div>
                    <div className=' items-center flex flex-col gap-y-7 '>
                        <Textfield placeholder='Mobile number...'></Textfield>
                        {/* <Textfield placeholder='OTP'></Textfield> */}
                        <button className='p-3 pt-2 pb-2 border font-mono text-white w-[100%] bg-black border-white rounded-full hover:bg-white hover:text-black'>Send OTP</button>
                    </div>
                </div>
            </div>
            </div>
    )
}

export default Signin;