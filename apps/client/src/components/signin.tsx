"use client"

import { useRef, useState } from 'react';

const Signin = () => {
    
    const [otpSent, setSendOtp] = useState(false)
    const mobileNumber = useRef();
    const otp = useRef();
    return (
        <div className="fixed h-screen w-screen backdrop-blur-lg  bg-black/5 flex flex-col items-center z-20">
            <div className=" flex-1 lg:w-[40%] w-[70%] justify-center content-center">
                <div className=" bg-gradient-to-br from-white/45 text-white  rounded-3xl flex flex-col gap-y-7 py-8 px-6 shadow-2xl shadow-black">
                    <div className=' text-center text-5xl'>
                        Sign in.
                    </div>
                    <div className=' items-center flex flex-col gap-y-7 '> 
                        {
                            otpSent ? <>
                                <input  onChange={(e:any) => {mobileNumber.current = e.target.value}} className="text-white text-center border border-white  w-[100%] bg-transparent  rounded-full p-3 outline-none placeholder:text-white placeholder:text-center read-only" value={mobileNumber.current} ></input>
                                <input  onChange={(e:any) => {otp.current = e.target.value}} className="text-white text-center border border-white  w-[100%] bg-transparent  rounded-full p-3 outline-none placeholder:text-white placeholder:text-center read-only:" placeholder={'OTP...'} ></input>
                                <button className='p-3 pt-2 pb-2  text-white w-[100%] border-white hover:bg-white hover:text-black border rounded-full' onClick={() => {
                                    // TRPC call to verify the otp
                                    // setSendOtp(true);
                                }}>Verify OTP</button>
                                </>                            
                            :
                                <>
                                 <input  onChange={(e:any) => {mobileNumber.current = e.target.value}} className="text-white text-center border border-white  w-[100%] bg-transparent  rounded-full p-3 outline-none placeholder:text-white placeholder:text-center" placeholder='Mobile number...' ></input>
                                <button className='p-3 pt-2 pb-2  text-white w-[100%] border-white hover:bg-white hover:text-black border rounded-full' onClick={() => {
                                    // TRPC call to send the otp
                                    setSendOtp(true);
                                }}>Send OTP</button>
                                </>
                        }

                    </div>
                </div>
            </div>
            </div>
    )
}

export default Signin;