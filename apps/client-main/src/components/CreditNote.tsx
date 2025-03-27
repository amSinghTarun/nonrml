"use client"

import { RouterOutput, trpc } from "@/app/_trpc/client";
import { Form, FormInputField, FormSubmitButton } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useState } from "react";
import { CreditNoteDetails } from "./CreditNoteDetails";
import { GeneralButton, GeneralButtonTransparent } from "./ui/buttons";
import { useToast } from "@/hooks/use-toast";
import CreditNoteOTPVerification from "./CreditNotesList";

type creditNoteDetails = RouterOutput["viewer"]["creditNotes"]["getCreditNoteDetails"]["data"];

interface CreditNoteProps {
    className?: string
};
export const CreditNote : React.FC<CreditNoteProps> = (creditNoteProps) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState<{creditNoteCode: string, userMobile:string}>({creditNoteCode:"", userMobile:""})
    const [error, setError] = useState<string|null>(null);
    const [showCredits, setShowCredits] = useState<boolean>(false);
    const [creditNoteDetails, setCreditNoteDetails] = useState<creditNoteDetails>();
    const [formError, setFormError] = useState<string|null>(null);
    const creditNote = trpc.useUtils();
    const sendCreditViewOtp = trpc.viewer.creditNotes.sendCreditNoteOtp.useMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        setError(null);
        let {name, value} = e.target;
        let setNewFormData = true;
        if(name == "userMobile"){
            value = e.target.value.replace(/[\D\s]/g, "")
            setNewFormData = value.length <= 10 
        }
        setNewFormData && setFormData({...formData, [name]:value});
    }
    
    const handleSubmit = async () => {
        try{
            if(formData.userMobile.length < 10 || !/^[6-9]\d{9}$/g.test(formData.userMobile))
                throw new Error("Please enter a valid 10 digit mobile number");
            const creditNoteDetails = await creditNote.viewer.creditNotes.getCreditNoteDetails.fetch({creditNoteCode: formData.creditNoteCode, mobile: formData.userMobile});
            setCreditNoteDetails(creditNoteDetails.data);
        } catch(error: any){
            setError(error.message)
        }
    }

    const handleCreditShowOTP = () => {
        try{
                // here we are
            sendCreditViewOtp.mutate({});
            if(sendCreditViewOtp.isSuccess){
                setShowCredits(true);
            }
        } catch(error:any) {
            toast({variant:"destructive", title: error.message ?? "Can'nt serve you right now, Sorry!", duration:5000 })
        }
    }

    const handleCreditShowOTPSubmit = () => {
        try{
            let otp = "786767"
            creditNote.viewer.creditNotes.getAllCreditNotes.fetch({otp: otp})
            if(sendCreditViewOtp.isSuccess){
                console.log("show credits with email and code")
                // most probably set state for to show the note prompt or whatever
            }
        } catch(error:any) {
            toast({variant:"destructive", title: error.message ?? "Can'nt serve you right now, Sorry!", duration:5000 })
        }
    }
    
    return (
        <div className={cn("h-[80%] w-[90%] flex flex-col text-center", creditNoteProps.className)}>
            {showCredits && <CreditNoteOTPVerification></CreditNoteOTPVerification>}
            <h1 className={`flex text-neutral-800 font-medium justify-center text-sm mb-1 ${!creditNoteDetails && "place-items-end basis-1/3 text-xl"}`}>
            CREDIT NOTE
            </h1>
            { !creditNoteDetails && <p className="mb-10 text-neutral-500 text-[10px] sm:text-xs">Enter The Mobile Number Linked To The Credit Note Owner.</p> }
            {
                creditNoteDetails 
                ? <CreditNoteDetails creditNoteDetails={creditNoteDetails}></CreditNoteDetails> 
                : <Form 
                    className="flex justify-center text-sm items-center px-10"
                    action={handleSubmit}
                >
                    <FormInputField 
                        name="creditNoteCode"
                        value={formData?.creditNoteCode}
                        onChange={handleChange}
                        className="bg-white p-5 rounded-md placeholder:text-xs shadow-sm shadow-neutral-200 text-neutral-800 placeholder:text-neutral-500 w-full"
                        placeholder="Credit Note Code"
                    />
                    <FormInputField
                        name="userMobile"
                        value={formData?.userMobile}
                        onChange={handleChange}
                        className="bg-white p-5 shadow-sm placeholder:text-xs rounded-md shadow-neutral-200 text-neutral-800 placeholder:text-neutral-500 w-full"
                        placeholder="Mobile Number"/>
                    {
                        <p className="text-red-500 text-xs pl-3">{formError || error}</p>
                    } 
                    <FormSubmitButton 
                        type="submit"
                        label="VIEW DETAILS"
                       className="w-fit p-5 text-xs font-medium bg-neutral-800 hover:underline hover:text-white hover:bg-neutral-900 rounded-md"
                    />
                </Form>
            }
            <GeneralButtonTransparent 
                display={` ${sendCreditViewOtp.isLoading ? "..." : "SHOW ALL"}`}
                onClick={handleCreditShowOTP}
                className="p-4 text-xs"
            />
            { creditNoteDetails && <div className="w-full flex flex-1 justify-center"><GeneralButton className="p-5 w-40 font-medium rounded-md text-xs" display="Close" onClick={() => setCreditNoteDetails(undefined)} /></div>}
        </div>
    )
};