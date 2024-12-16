"use client"

import { FormEvent, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { TRPCClientError } from "@trpc/client";
import { trpc } from '@/app/_trpc/client';
import { Form, FormInputField, FormSubmitButton } from './ui/form';
import { DecisionButton } from './ui/buttons';

const Signin = () => {
    const [otpSent, setSendOtp] = useState(false)
    const [mobileNumber, setMobileNumber] = useState("");
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState("");

    const sendOTP = trpc.viewer.auth.sendOTP.useMutation();
    const verifyOTP = trpc.viewer.auth.verifyOTP.useMutation();

    const mobileNumberOnChange = (e:any) => {
        setError(null)
        const value = e.target.value.replace(/\D/g, "");
        value.length <= 10 && setMobileNumber(value)
    };

    const onMobileSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null) // Clear previous errors when a new request starts
        try {
            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            setSendOtp(true);
            !otpSent && await sendOTP.mutateAsync({contactNumber: mobileNumber});
        } catch (error:any) {
            setError(error.message ? error.message : "Having some trouble, try after sometime")
      };
    };

    const onOtpResend = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null) // Clear previous errors when a new request starts
        try {
            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            setOtp("");
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
                                className={`w-full text-center text-md placeholder:text-sm placeholder:text-black/80 text-black bg-white/20 backdrop-blur-3xl ${otpSent && "rounded-r-none"}`}
                                required 
                                value = {mobileNumber} 
                                type = "string" 
                                onChange = {otpSent ? ()=>{} : mobileNumberOnChange} placeholder='Enter Mobile Number . . .'
                            />
                            { otpSent && <DecisionButton display='CHANGE' onClickFnc={() => {setSendOtp(false), setOtp(""), setError(null)}} /> }
                        </div>
                        { otpSent && 
                            < FormInputField 
                                className={`w-full text-center text-md placeholder:text-sm placeholder:text-black/80 text-black bg-white/20 backdrop-blur-3xl`}
                                type="string" 
                                value={otp} 
                                required
                                onChange={otpOnChange} placeholder={'ENTER OTP . . .'}
                            />
                        }
                        <FormSubmitButton 
                            type='submit'
                            label={otpSent ? "VERIFY OTP" : "SEND OTP"}
                            className='p-3'
                        />
                    </Form>
                }</div>
                { otpSent && < span className='pl-3 text-xs text-left hover:cursor-pointer' onClick={ () => onOtpResend } > RESEND OTP ... </span> }
            </div>
        </div>
        </>
    )
}

export default Signin;