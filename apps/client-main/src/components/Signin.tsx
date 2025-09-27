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
            // Save current scroll position
            const scrollY = window.scrollY;
            
            // Block scroll
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
            
            // Cleanup function
            return () => {
                // Restore scroll
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                
                // Restore scroll position
                window.scrollTo(0, scrollY);
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

    // Prevent background scroll when touching blur area
    const handleBackgroundTouch = (e: React.TouchEvent) => {
        e.preventDefault();
    };

    const handleBackgroundWheel = (e: React.WheelEvent) => {
        e.preventDefault();
    };

    return (
        <>
        {/* Background blur overlay - blocks all scroll events */}
        <div 
            className="fixed z-40 backdrop-blur-sm bg-white/10 h-full w-full overflow-hidden overscroll-none"
            onTouchMove={handleBackgroundTouch}
            onWheel={handleBackgroundWheel}
            style={{ touchAction: 'none' }}
        ></div>
        
        <div className="fixed flex flex-col w-screen justify-center items-center z-40 h-full">
            <div className="backdrop-blur-3xl rounded-md shadow-sm p-4 shadow-neutral-800 flex flex-col w-[80%] md:w-[60%] xl:w-[40%] lg:w-[40%] justify-center overflow-hidden">
                <div className="flex flex-1 flex-col mb-4">
                    <div className='text-left text-2xl text-black font-bold mb-1 '>
                        WELCOME BACK!
                    </div>
                    <div className='text-left text-xs text-black font-light'>
                        Login for a better personalised experience
                    </div>
                </div>
                <div className="overflow-y-auto max-h-96"> {
                    <Form onSubmit={otpSent ? onOTPSubmit : onMobileSubmit} >
                        <div className="flex flex-row">
                            {!otpSent ? (
                                <div className="relative w-full">
                                    <div className="absolute border-r border-neutral-800 px-3 top-1/2 transform -translate-y-1/2 text-sm text-black font-medium pointer-events-none">
                                        +91
                                    </div>
                                    <FormInputField
                                        className="text-center text-sm placeholder:text-xs placeholder:text-neutral-500 text-black bg-white/20 backdrop-blur-3xl w-full pl-12"
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
                                        <div className="absolute px-3 border-r border-neutral-800 top-1/2 transform -translate-y-1/2 text-sm text-black font-medium pointer-events-none">
                                            +91
                                        </div>
                                        <FormInputField
                                            className="text-center text-sm placeholder:text-xs placeholder:text-neutral-500 text-black bg-white/20 backdrop-blur-3xl rounded-r-none w-full pl-12"
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
                                        className='p-2 basis-1/5 text-xs rounded-r-md text-neutral-600 border-l bg-white/20 backdrop-blur-3xl border-neutral-400 hover:bg-neutral-800 hover:text-white' 
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
                                        className="w-full basis-4/5 text-center text-sm placeholder:text-xs placeholder:text-neutral-500 text-black bg-white/20 backdrop-blur-3xl rounded-r-none"
                                        type="string" 
                                        value={otp} 
                                        required
                                        onChange={otpOnChange} 
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                    />
                                    <button 
                                        type='button' 
                                        className='basis-1/5 hover:bg-neutral-800 rounded-r-md border-neutral-400 text-neutral-600 border-l bg-white/20 text-center cursor-pointer text-xs p-2 hover:text-white' 
                                        onClick={onOtpResend}
                                        disabled={sendOTP.isLoading}
                                    >
                                        {sendOTP.isLoading ? "SENDING" : "RESEND"}
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {error && (
                            <p className="text-red-500 text-xs pl-3 mt-2">{error}</p>
                        )}
                        
                        <FormSubmitButton 
                            type='submit'
                            label={otpSent ? (verifyOTP.isLoading ? "VERIFYING..." : "VERIFY OTP") : (sendOTP.isLoading ? "SENDING..." : "SEND OTP")}
                            className="w-full p-5 text-xs font-bold bg-neutral-800 hover:underline hover:text-white hover:bg-neutral-900 rounded-md mt-4"
                        />
                    </Form>
                }</div>
            </div>
        </div>
        </>
    )
}

export default Signin;