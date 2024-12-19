"use client"

import { trackOrder } from "@/app/actions/trackOrder.action";
import { Form, FormInputField, FormSubmitButton } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useState } from "react";
import { useCartItemStore } from "@/store/atoms"

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

    const handleSubmit = () => {
        if(formData.mobile.length < 10 || !/^[6-9]\d{9}$/g.test(formData.mobile)){
            submitForm = false;
            setFormError("Please enter a valid 10 digit mobile number");
        }
    };

    return (
        <div className={cn("rounded-xl h-[80%] bg-white/10 w-[90%] flex flex-col backdrop-blur-3xl p-4 text-center", trackOrderProps.className)}>
            <h1 className="flex text-black justify-center place-items-end basis-1/3 text-4xl mb-1">
                TRACK ORDER
            </h1>
            <p className="mb-10 text-sm">Please Enter The Mobile Associated With The Order</p>
            <Form 
                className="flex justify-center text-sm items-center px-10"
                action={async () => {
                    try{
                        handleSubmit();
                        submitForm && await trackOrder({orderId: formData.orderId, mobile: formData.mobile});
                    } catch(error: any){
                        setError(error.message)
                    }
                }}
            >
                {error && <div className='text-white text-xs bg-red-600 text-center p-2 rounded-xl'>{error}</div>}
                <FormInputField 
                    name="orderId"
                    value={formData?.orderId}
                    onChange={handleChange}
                    className="bg-white/20 p-5 shadow-sm shadow-black/15 text-black placeholder:text-black/80 w-full"
                    placeholder="Order Id"
                />
                <FormInputField
                    name="mobile"
                    value={formData?.mobile}
                    onChange={handleChange}
                    className="bg-white/20 p-5 shadow-sm shadow-black/15 text-black placeholder:text-black/80 w-full"
                    placeholder="Mobile Number"/>
                {
                    <p className="text-red-500 text-xs pl-3">{formError}</p>
                } 
                <FormSubmitButton 
                    type="submit"
                    label="TRACK ORDER"
                    className="w-fit p-5 text-sm font-medium"
                />
            </Form>
        </div>
    )
};