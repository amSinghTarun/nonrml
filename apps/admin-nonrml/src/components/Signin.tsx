"use client"

import { FormEvent, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { trpc } from '@/app/_trpc/client';
import { Form, FormInputField, FormSubmitButton } from './ui/form';

const Signin = () => {
    const [otpSent, setSendOtp] = useState(false)
    const [mobileNumber, setMobileNumber] = useState("");
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState("");

    const sendOTP = trpc.viewer.auth.sendOTP.useMutation();
    const verifyOTP = trpc.viewer.auth.verifyOTP.useMutation();

    const mobileNumberOnChange = (e:any) => {
        setError(null);
        setSendOtp(false)
        const value = e.target.value.replace(/\D/g, "");
        value.length <= 10 && setMobileNumber(value)
    };

    const onMobileSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault()
            setError(null) // Clear previous errors when a new request starts
            if(sendOTP.isLoading)
                return

            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            console.log("OTP SEND");
            !otpSent && await sendOTP.mutateAsync({contactNumber: mobileNumber});
            setSendOtp(true);

        } catch (error:any) {
            setError(error.message ? error.message : "Having some trouble, try after sometime")
      };
    };

    const onOtpResend = async () => {
        try {
            setError(null) // Clear previous errors when a new request starts
            setOtp("");
            if(sendOTP.isLoading)
                return

            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            await sendOTP.mutateAsync({contactNumber: mobileNumber});

        } catch (error:any) {
            setError(error.message ? error.message : "Having some trouble, try after sometime")
        };
    };

    const otpOnChange = (e: any) => {
        setError(null)
        const value = e.target.value.replace(/\D/g, "");
        value.length <= 6 && setOtp(value);
    };

    const onOTPSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        let lengthError = false;
        try{
            if(verifyOTP.isLoading)
                return;

            if(otp.length != 6){
                lengthError = true;
                throw new Error("OTP should be 6 digit long");
            }
            const userVerified = await verifyOTP.mutateAsync({contactNumber: mobileNumber, otp: Number(otp)});
            if(userVerified.data.id)
                signIn("credentials", {id: userVerified.data.id});

        } catch(error:any) {
            // for type validation we need to check for array.
            //console.log(error)
            lengthError ?  setError("OTP should be 6 digit long") : setError(typeof error.message == "object" ? JSON.parse(error.message)[0].message : error.message);
        };
    };

    return (
        <>
        <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none "></div>
        <div className="fixed flex flex-col w-screen justify-center items-center z-40 h-full">
            <div className=" backdrop-blur-3xl rounded-xl shadow-sm p-4 shadow-black/80 flex flex-col w-[80%] md:w-[60%] xl:w-[40%] lg:w-[40%] justify-center">
                <div className = " flex flex-1 flex-col pb-2 rounded-t-xl ">
                    <div className='text-left text-3xl text-black font-medium mb-1 '>
                        WELCOME BACK!
                    </div>
                    <div className='text-left text-xs text-black font-normal'>
                        Login for a better personalised experience
                    </div>
                </div>
                <div className='p-2 pb-3'> {
                    <Form onSubmit={otpSent ? onOTPSubmit : onMobileSubmit} >
                        {error && <div className='text-white text-xs bg-red-600 text-center p-2 rounded-xl'>{error}</div>}
                        <div className='flex flex-row'>
                            <FormInputField
                                className={` text-center text-md placeholder:text-sm placeholder:text-black/80 text-black bg-white/20 backdrop-blur-3xl ${otpSent ? "rounded-r-none basis-4/5 w-full" : "w-full"}`}
                                required 
                                value = {mobileNumber} 
                                type = "string" 
                                onChange = {otpSent ? ()=>{} : mobileNumberOnChange} placeholder='Enter Mobile Number . . .'
                            />
                            { otpSent && <button type="button" className=' p-2 basis-1/5 text-xs rounded-r-xl text-white bg-stone-700 hover:text-red-500 hover:bg-red-200' onClick={mobileNumberOnChange}> CHANGE</button> }
                        </div>
                        { otpSent && 
                            <div className='flex flex-row'>
                            < FormInputField 
                                className={`w-full basis-4/5 text-center text-md placeholder:text-sm placeholder:text-black/80 text-black bg-white/20 backdrop-blur-3xl rounded-r-none`}
                                type="string" 
                                value={otp} 
                                required
                                onChange={otpOnChange} placeholder={'ENTER OTP . . .'}
                            />
                            <button type='button' className='basis-1/5 rounded-r-xl text-white bg-stone-700 text-center cursor-pointer hover:bg-white hover:text-black text-xs p-2' onClick={onOtpResend} >{sendOTP.isLoading ? "SENDING": "RESEND"}</button>
                        </div>
                        }
                        <FormSubmitButton 
                            type='submit'
                            label={otpSent ? (verifyOTP.isLoading ? "VERIFYING..." : "VERIFY OTP") : (sendOTP.isLoading ? "SENDING..." : "SEND OTP")}
                            className={`p-3 `}
                        />
                    </Form>
                }</div>
            </div>
        </div>
        </>
    )
}

export default Signin;