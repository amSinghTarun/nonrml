"use client"

import { FormEvent, useRef, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { trpc } from '@/app/_trpc/client';
import { Form, FormInputField, FormSubmitButton } from './ui/form';

const Signin = () => {
    const [otpSent, setSendOtp] = useState(false)
    const [mobileNumber, setMobileNumber] = useState("");
    const [error, setError] = useState<string | null>(null)
    const [otp, setOtp] = useState("");
    const [isVisible, setIsVisible] = useState(true); // Track if signin modal is visible

    const sendOTP = trpc.viewer.auth.sendOTP.useMutation();
    const verifyOTP = trpc.viewer.auth.verifyOTP.useMutation();

    // Block background scroll when signin modal is visible
    useEffect(() => {
        if (isVisible) {
            const originalOverflow = document.body.style.overflow;
            const originalHeight = document.body.style.height;
            
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.height = originalHeight;
            };
        }
    }, [isVisible]);

    // Get full mobile number with country code for API calls
    const getFullMobileNumber = () => {
        return `+91${mobileNumber}`;
    };

    const mobileNumberOnChange = (e: any) => {
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
                setError("Mobile number should be 10 digits long")
                return
            }
            !otpSent && await sendOTP.mutateAsync({contactNumber: getFullMobileNumber()})
            setSendOtp(true)
        } catch (error: any) {
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
                setError("Mobile number should be 10 digits long");
                return;
            }
            await sendOTP.mutateAsync({contactNumber: getFullMobileNumber()});
        } catch (error: any) {
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
                throw new Error("OTP should be 6 digits long");
            }
            const userVerified = await verifyOTP.mutateAsync({contactNumber: getFullMobileNumber(), otp: Number(otp)});
            if(userVerified.data.id)
                signIn("credentials", {id: userVerified.data.id});
        } catch(error: any) {
            lengthError ? setError("OTP should be 6 digits long") : setError(typeof error.message == "object" ? JSON.parse(error.message)[0].message : error.message);
        };
    };

    const handleChangeNumber = () => {
        setError(null);
        setSendOtp(false);
        setOtp("");
        setMobileNumber("");
    };

    return (
        <>
        {/* Background blur overlay */}
        <div 
            className="fixed inset-0 z-40 backdrop-blur-sm bg-white/10 overflow-hidden"
            style={{ touchAction: 'none' }}
        />
        
        {/* Centered modal container - NO translate classes here */}
        <div className="fixed inset-0 z-40 flex flex-col justify-center items-center">
            {/* Apply any entrance animation to this div */}
            <div className="backdrop-blur-3xl rounded-md shadow-sm p-4 shadow-black/30 flex flex-col w-[80%] md:w-[60%] xl:w-[40%] lg:w-[40%] justify-center overflow-hidden animate-[slideDown_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                <div className="flex flex-1 flex-col mb-4">
                    <div className='text-left text-sm text-black font-bold tracking-[0.3em] mb-1'>
                        WELCOME BACK!
                    </div>
                    <div className='text-left text-[10px] text-black/40 font-normal tracking-[0.15em]'>
                        Login for a better personalised experience
                    </div>
                </div>
                <div className="overflow-y-auto max-h-96"> {
                    <Form onSubmit={otpSent ? onOTPSubmit : onMobileSubmit} >
                        <div className="flex flex-row">
                            {!otpSent ? (
                                <div className="relative w-full">
                                    <div className="absolute border-r border-black/20 px-3 top-1/2 transform -translate-y-1/2 text-xs text-black/70 font-bold tracking-wider pointer-events-none">
                                        +91
                                    </div>
                                    <FormInputField
                                        className="text-center text-sm placeholder:text-xs placeholder:text-black/30 text-black/80 bg-white/20 backdrop-blur-3xl w-full pl-12"
                                        required 
                                        value={mobileNumber} 
                                        type="string" 
                                        onChange={mobileNumberOnChange} 
                                        placeholder='Enter 10-digit mobile number'
                                        maxLength={10}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="basis-4/5 w-full relative">
                                        <div className="absolute px-3 border-r border-black/20 top-1/2 transform -translate-y-1/2 text-xs text-black/70 font-bold tracking-wider pointer-events-none">
                                            +91
                                        </div>
                                        <FormInputField
                                            className="text-center text-sm placeholder:text-xs placeholder:text-black/30 text-black/80 bg-white/20 backdrop-blur-3xl rounded-r-none w-full pl-12"
                                            required 
                                            value={mobileNumber} 
                                            type="string" 
                                            onChange={() => {}} // Disabled when OTP is sent
                                            placeholder='Mobile number'
                                            disabled
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className='p-2 basis-1/5 text-[10px] tracking-[0.1em] font-bold rounded-r-md text-black/50 border-l bg-white/20 backdrop-blur-3xl border-black/20 hover:bg-black/80 hover:text-white' 
                                        onClick={handleChangeNumber}
                                    > 
                                        CHANGE
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {otpSent && (
                            <>
                                <div className='flex flex-row rounded-md mt-3'>
                                    <FormInputField 
                                        className="w-full basis-4/5 text-center text-sm placeholder:text-xs placeholder:text-black/30 text-black/80 bg-white/20 backdrop-blur-3xl rounded-r-none"
                                        type="string" 
                                        value={otp} 
                                        required
                                        onChange={otpOnChange} 
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                    />
                                    <button 
                                        type='button' 
                                        className='basis-1/5 hover:bg-black/80 rounded-r-md border-black/20 text-black/50 border-l bg-white/20 text-center cursor-pointer text-[10px] tracking-[0.1em] font-bold p-2 hover:text-white' 
                                        onClick={onOtpResend}
                                        disabled={sendOTP.isLoading}
                                    >
                                        {sendOTP.isLoading ? "SENDING" : "RESEND"}
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {error && (
                            <p className="text-red-500/70 text-[10px] tracking-wider pl-3 mt-2">{error}</p>
                        )}
                        
                        <FormSubmitButton 
                            type='submit'
                            label={otpSent ? (verifyOTP.isLoading ? "VERIFYING..." : "VERIFY OTP") : (sendOTP.isLoading ? "SENDING..." : "SEND OTP")}
                            className="w-full p-5 text-[10px] tracking-[0.2em] font-bold bg-black/80 hover:bg-black rounded-md mt-4"
                        />
                    </Form>
                }</div>
            </div>
        </div>
        </>
    )
}

export default Signin;