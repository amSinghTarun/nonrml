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
    const sendingOTP = useRef(false);
    const verifyingOTP = useRef(false);

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
            if(sendingOTP.current)
                return
            sendingOTP.current = true;
            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            !otpSent && await sendOTP.mutateAsync({contactNumber: mobileNumber});
            setSendOtp(true);
            sendingOTP.current = false
        } catch (error:any) {
            sendingOTP.current = false;
            setError(error.message ? error.message : "Having some trouble, try after sometime")
      };
    };

    const onOtpResend = async () => {
        try {
            setError(null) // Clear previous errors when a new request starts
            setOtp("");
            if(sendingOTP.current)
                return
            sendingOTP.current = true;
            if(mobileNumber.length != 10){
                setError("Mobile number should be 10 digit long");
                return;
            }
            await sendOTP.mutateAsync({contactNumber: mobileNumber});
            sendingOTP.current = false
        } catch (error:any) {
            sendingOTP.current = false
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
            if(verifyingOTP.current)
                return;
            verifyingOTP.current = true;
            if(otp.length != 6){
                lengthError = true;
                throw new Error("OTP should be 6 digit long");
            }
            const userVerified = await verifyOTP.mutateAsync({contactNumber: mobileNumber, otp: Number(otp)});
            if(userVerified.data.id)
                signIn("credentials", {id: userVerified.data.id});
            verifyingOTP.current = false
        } catch(error:any) {
            // for type validation we need to check for array.
            //console.log(error)
            verifyingOTP.current = false
            lengthError ?  setError("OTP should be 6 digit long") : setError(typeof error.message == "object" ? JSON.parse(error.message)[0].message : error.message);
        };
    };

    return (
        <>
        {/* this is required to make backdrop work as on direct parent childern the children backdrop blue doesn't apply */}
        <div className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none "></div>
        <div className="fixed flex flex-col w-screen justify-center items-center z-40 h-full">
            <div className=" backdrop-blur-3xl rounded-md shadow-sm p-4 shadow-neutral-800 flex flex-col w-[80%] md:w-[60%] xl:w-[40%] lg:w-[40%] justify-center">
                <div className = " flex flex-1 flex-col mb-4">
                    <div className='text-left text-2xl text-black font-medium mb-1 '>
                        WELCOME BACK!
                    </div>
                    <div className='text-left text-xs text-black font-light'>
                        Login for a better personalised experience
                    </div>
                </div>
                <div > {
                    <Form onSubmit={otpSent ? onOTPSubmit : onMobileSubmit} >
                        <div className="flex flex-row">
                            <FormInputField
                                className={` text-center text-sm placeholder:text-xs placeholder:text-neutral-700 text-black bg-white/20 backdrop-blur-3xl ${otpSent ? "rounded-r-none basis-4/5 w-full" : "w-full"}`}
                                required 
                                value = {mobileNumber} 
                                type = "string" 
                                onChange = {otpSent ? ()=>{} : mobileNumberOnChange} 
                                placeholder='Enter Mobile Number . . .'
                            />
                            { otpSent && <button type="button" className=' p-2 basis-1/5 text-xs rounded-r-md text-neutral-600 border-l bg-white/20 backdrop-blur-3xl border-neutral-400 hover:underline hover:text-white' onClick={mobileNumberOnChange}> CHANGE</button> }
                        </div>
                        { otpSent && 
                            <div className='flex flex-row rounded-md'>
                            < FormInputField 
                                className={`w-full basis-4/5 text-center text-sm placeholder:text-xs placeholder:text-neutral-700 text-black bg-white/20 backdrop-blur-3xl rounded-r-none`}
                                type="string" 
                                value={otp} 
                                required
                                onChange={otpOnChange} placeholder={'ENTER OTP . . .'}
                            />
                            <button type='button' className='basis-1/5 rounded-r-md border-neutral-400 text-neutral-600 border-l bg-white/20 text-center cursor-pointer hover:underline text-xs p-2 hover:text-white' onClick={onOtpResend} >{sendingOTP.current ? "SENDING": "RESEND"}</button>
                        </div>
                        }
                        {
                            <p className="text-red-500 text-xs pl-3">{error}</p>
                        }
                        <FormSubmitButton 
                            type='submit'
                            label={otpSent ? (verifyingOTP.current ? "VERIFYING..." : "VERIFY OTP") : (sendingOTP.current ? "SENDING..." : "SEND OTP")}
                            className="w-full p-5 text-xs font-medium bg-neutral-800 hover:underline hover:text-white hover:bg-neutral-900 rounded-md"
                        />
                    </Form>
                }</div>
            </div>
        </div>
        </>
    )
}

export default Signin;