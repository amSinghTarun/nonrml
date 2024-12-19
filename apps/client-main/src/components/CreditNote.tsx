"use client"

import { RouterOutput } from "@/app/_trpc/client";
import { viewCreditNote } from "@/app/actions/creditNotes.action";
import { Form, FormInputField, FormSubmitButton } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useState } from "react";
import { CreditNoteDetails } from "./CreditNoteDetails";
import { GeneralButton } from "./ui/buttons";

type creditNoteDetails = RouterOutput["viewer"]["creditNotes"]["getCreditNoteDetails"]["data"];

interface CreditNoteProps {
    className?: string
};
export const CreditNote : React.FC<CreditNoteProps> = (creditNoteProps) => {
    const [formData, setFormData] = useState<{creditNoteCode: string, userMobile:string}>({creditNoteCode:"", userMobile:""})
    const [error, setError] = useState<string|null>(null);
    const [creditNoteDetails, setCreditNoteDetails] = useState<creditNoteDetails>();
    const [formError, setFormError] = useState<string|null>(null);
    
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
            const creditNoteDetails = await viewCreditNote({creditNote: formData.creditNoteCode, userMobile: formData.userMobile});
            setCreditNoteDetails(creditNoteDetails);
        } catch(error: any){
            setError(error.message)
        }
    }
    
    return (
        <div className={cn("rounded-xl h-[80%] bg-white/10 w-[90%] flex flex-col backdrop-blur-3xl p-4 text-center", creditNoteProps.className)}>
            <h1 className={`flex text-black justify-center ${!creditNoteDetails && "place-items-end basis-1/3"}  text-4xl mb-1`}>
                CREDIT NOTE
            </h1>
            { !creditNoteDetails && <p className="mb-10 text-sm">CHANGE IT</p> }
            {
                creditNoteDetails 
                ? <CreditNoteDetails creditNoteDetails={creditNoteDetails}></CreditNoteDetails> 
                : <Form 
                    className="flex justify-center text-sm items-center px-10"
                    action={handleSubmit}
                >
                    {error && <div className='text-white text-xs bg-red-600 text-center p-2 rounded-xl'>{error}</div>}
                    <FormInputField 
                        name="creditNoteCode"
                        value={formData?.creditNoteCode}
                        onChange={handleChange}
                        className="bg-white/20 p-5 shadow-sm shadow-black/15 text-black placeholder:text-black/80 w-full"
                        placeholder="Credit Note Code"
                    />
                    <FormInputField
                        name="userMobile"
                        value={formData?.userMobile}
                        onChange={handleChange}
                        className="bg-white/20 p-5 shadow-sm shadow-black/15 text-black placeholder:text-black/80 w-full"
                        placeholder="Mobile Number"/>
                    {
                        <p className="text-red-500 text-xs pl-3">{formError}</p>
                    } 
                    <FormSubmitButton 
                        type="submit"
                        label="VIEW DETAILS"
                        className="w-fit p-5 text-sm font-medium"
                    />
                </Form>
            }
            { creditNoteDetails && <GeneralButton className="py-3 rounded-xl bg-black text-white hover:bg-white hovere:text-black" display="Close" onClick={() => setCreditNoteDetails(undefined)} />}
        </div>
    )
};