"use client"

import { trpc } from "@/app/_trpc/client";
import { Form, FormInputField, FormSubmitButton } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useState } from "react";

interface TrackOrderProps {
    className?: string
};
export const TrackOrder : React.FC<TrackOrderProps> = (trackOrderProps) => {
    const [formData, setFormData] = useState<{orderId: string, mobile:string}>({orderId:"", mobile:""})
    const [error, setError] = useState<string|null>(null);
    const [formError, setFormError] = useState<string|null>(null);
    let submitForm = true;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        setError(null);
        setFormError(null);
        let {name, value} = e.target;
        let setNewFormData = true;
        if(name == "mobile"){
            value = e.target.value.replace(/[\D\s]/g, "");
            setNewFormData = value.length <= 10;
        }
        setNewFormData && setFormData({...formData, [name]:value});
    };

    const handleSubmit = async () => {
        try{
            if(formData.mobile.length < 10 || !/^[6-9]\d{9}$/g.test(formData.mobile)){
                submitForm = false;
                setFormError("Please enter a valid 10 digit mobile number");
            }
            const trpcTrackOrder = trpc.useUtils().viewer.orders.trackOrder;
            if(submitForm) {
                const trackData = await trpcTrackOrder.fetch({orderId: formData.orderId, mobile: formData.mobile});
                // redirect as per trackorder
            }
        } catch(error: any){
            setError(error.message)
        }
    };

    return (
        <div className={cn("w-[90%] text-neutral-800 flex flex-col text-center text-xs", trackOrderProps.className)}>
            <h1 className="flex justify-center text-neutral-800 font-medium place-items-end basis-1/3 text-xl mb-1">
                TRACK ORDER
            </h1>
            <p className="mb-10 text-xs text-neutral-500">Enter The Mobile Used In Shipping Address Of Respective Order</p>
            <Form 
                className="flex justify-center text-sm items-center px-10"
                action={handleSubmit}
            >
                <FormInputField 
                    name="orderId"
                    value={formData?.orderId}
                    onChange={handleChange}
                    className="bg-white p-5 placeholder:text-xs rounded-md shadow-sm shadow-neutral-200 text-neutral-800 placeholder:text-neutral-700 w-full"
                    placeholder="Order Id"
                />
                <FormInputField
                    name="mobile"
                    value={formData?.mobile}
                    onChange={handleChange}
                    className="bg-white p-5 placeholder:text-xs rounded-md shadow-sm shadow-neutral-200 text-neutral-800 placeholder:text-neutral-700 w-full"
                    placeholder="Mobile Number"/>
                {
                    <p className="text-red-500 text-xs pl-3">{formError || error}</p>
                } 
                {/* {error && <div className='text-red-500 text-xs text-center p-2 '>{error}</div>} */}
                <FormSubmitButton 
                    type="submit"
                    label="TRACK ORDER"
                    className="w-fit p-5 text-xs font-medium bg-neutral-800 hover:underline hover:text-white hover:bg-neutral-900 rounded-md"
                />
            </Form>
        </div>
    )
};