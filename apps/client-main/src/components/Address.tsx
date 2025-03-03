"use clinet"
import { cn } from "@/lib/utils"
import { Form, FormInputField, FormSubmitButton } from "./ui/form"
import { GeneralButton, GeneralButtonTransparent } from "./ui/buttons"
import { useState } from "react"
import React from "react"
import { addAddress, editAddress } from "@/app/actions/address.action"
import { RouterOutput } from "@/app/_trpc/client"

type AddressesTRPCOutput = RouterOutput["viewer"]["address"]["getAddresses"]["data"]

interface EditAddressProps {
    onCancelClick: () => void
    className?: string
    address: Partial<AddressesTRPCOutput[number]>
}

type FormErrorType = {
    email?: string,
    pincode?: string,
    contactName?: string,
    location?: string,
    contactNumber?: string
}

export const EditAddress : React.FC<EditAddressProps> = (editdAddressProps) => {
    const [ formData, SetFormData ] = useState({
        contactName: editdAddressProps.address.contactName,
        location: editdAddressProps.address.location,
        pincode: editdAddressProps.address.pincode,
        city: editdAddressProps.address.city,
        state: editdAddressProps.address.state,
        email: editdAddressProps.address.email,
        contactNumber: editdAddressProps.address.contactNumber,
    });
    const [errors, setErrors] = useState<FormErrorType>({});
    
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;
        let setNewFormData = true;

        let errorMessages = { ...errors };

        if (name === "contactName") {
            if(value.length <= 2) 
                errorMessages[name] = "Enter a valid name";
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[0-9]/g, "").replace(/\s+/g, " ")
        }

        if (name === "location") {
            if(value.length < 10 )
                errorMessages[name] = "Enter a valid address" 
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/\s+/g, " ")
        }

        if (name === "contactNumber") {
            if(value.length < 10)
                errorMessages[name] = "Mobile number must be exactly 10 digits"
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[\D\s]/g, "")
            setNewFormData = value.length <= 10
        }
    
        if (name === "pincode") {
            if(value.length < 6)
                errorMessages[name] = "Pincode must be exactly 6 digits";
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[\D\s]/g, "")
            setNewFormData = value.length <= 6;
        }
    
        if (name === "email") {
            if(!validateEmail(value))
                errorMessages[name] = "Please enter a valid email address"
            else
                name in errorMessages && delete errorMessages[name];
        }

        setErrors(errorMessages);
        setNewFormData && SetFormData({
            ...formData,
            [name]: value
        });
    }

    const addressFormFields = [
        {
            name: "contactName",
            type: "string",
            placeholder: "Full Name",
            required: true,
            value: formData.contactName,
            onChange: handleFormInputChange
        },
        {
            name: "location",
            type: "string",
            placeholder: "Address",
            required: true,
            value: formData.location,
            onChange: handleFormInputChange
        },
        {
            name: "pincode",
            type: "string",
            placeholder: "Pincode",
            required: true,
            value: formData.pincode,
            onChange: handleFormInputChange
        },
        {
            name: "city",
            type: "string",
            placeholder: "City",
            required: true,
            readonly: true,
            value: formData.city,
            onChange: handleFormInputChange
        },
        {
            name: "state",
            type: "string",
            placeholder: "State",
            required: true,
            readonly: true,
            value: formData.state,
            onChange: handleFormInputChange
        },
        {
            name: "contactNumber",
            type: "string",
            placeholder: "Mobile Number",
            required: true,
            value: formData.contactNumber,
            onChange: handleFormInputChange
        },
        {
            name: "email",
            type: "email",
            placeholder: "Email ",
            required: true,
            value: formData.email,
            onChange: handleFormInputChange
        }
    ]

    return (
        <div className={cn("w-full p-2 text-xs flex h-full shadow-sm shadow-neutral-100 rounded-md", editdAddressProps.className)}> 
            <Form 
                action={async() => {
                    Object.keys(errors).length == 0 && (await editAddress({...formData, addressId: editdAddressProps.address.id!}), editdAddressProps.onCancelClick())
                }} 
                className="space-y-3 "
            >
                { addressFormFields.map( (field, index) => {
                    return (
                        <div className="h-full flex flex-col relative">
                            <FormInputField
                                {...field}
                                key={index}
                                className={`text-neutral-800 h-full shadow-sm shadow-neutral-100 placeholder:text-neutral-600`}
                                readOnly={field.readonly}
                            ></FormInputField>
                            {
                               <p className="pl-3 text-[10px] md:text-xs z-40 text-red-400 absolute right-1 bottom-0">{errors[field.name as keyof FormErrorType]}</p>
                            }
                        </div>
                        )
                    })}
                    <div className="flex flex-row space-x-4 w-full px-4 justify-around">
                        <FormSubmitButton type="submit" className={` ${ Object.keys(errors).length != 0 && "cursor-not-allowed" } basis-1/2 p-2 bg-neutral-800 rounded-sm text-white hover:bg-neutral-900 hover:underline text-[11px]`} label={"SAVE CHANGES"}></FormSubmitButton>
                        <GeneralButtonTransparent display="CANCEL" className="basis-1/2 py-2 text-[11px] rounded-sm" onClick={editdAddressProps.onCancelClick}/>
                    </div>

            </Form>
        </div>
    )
}

interface AddAddressProps {
    onCancelClick: () => void
    className?: string
}
export const AddAddress : React.FC<AddAddressProps> = (addAddressProps) => {
    const [ formData, SetFormData ] = useState({
        contactName: "",
        location: "",
        pincode: "",
        city: "",
        state: "",
        email: "",
        contactNumber: "",
    });
    const [errors, setErrors] = useState<FormErrorType>({});
    
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;
        let setNewFormData = true;

        let errorMessages = { ...errors };

        if (name === "contactName") {
            if(value.length <= 2) 
                errorMessages[name] = "Enter a valid name";
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[0-9]/g, "").replace(/\s+/g, " ")
        }

        if (name === "location") {
            if(value.length < 10 )
                errorMessages[name] = "Enter a valid address" 
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/\s+/g, " ")
        }

        if (name === "contactNumber") {
            if(value.length < 10)
                errorMessages[name] = "Mobile number must be exactly 10 digits"
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[\D\s]/g, "")
            setNewFormData = value.length <= 10
        }
    
        if (name === "pincode") {
            if(value.length < 6)
                errorMessages[name] = "Pincode must be exactly 6 digits";
            else
                name in errorMessages && delete errorMessages[name];
            value = e.target.value.replace(/[\D\s]/g, "")
            setNewFormData = value.length <= 6;
        }
    
        if (name === "email") {
            if(!validateEmail(value))
                errorMessages[name] = "Please enter a valid email address"
            else
                name in errorMessages && delete errorMessages[name];
        }

        setErrors(errorMessages);
        setNewFormData && SetFormData({
            ...formData,
            [name]: value
        });
    }

    const addressFormFields = [
        {
            name: "contactName",
            type: "string",
            placeholder: "Full Name",
            required: true,
            value: formData.contactName,
            onChange: handleFormInputChange
        },
        {
            name: "location",
            type: "string",
            placeholder: "Address",
            required: true,
            value: formData.location,
            onChange: handleFormInputChange
        },
        {
            name: "pincode",
            type: "string",
            placeholder: "Pincode",
            required: true,
            value: formData.pincode,
            onChange: handleFormInputChange
        },
        {
            name: "city",
            type: "string",
            placeholder: "City",
            required: true,
            readonly: true,
            value: formData.city,
            onChange: handleFormInputChange
        },
        {
            name: "state",
            type: "string",
            placeholder: "State",
            required: true,
            readonly: true,
            value: formData.state,
            onChange: handleFormInputChange
        },
        {
            name: "contactNumber",
            type: "string",
            placeholder: "Mobile Number",
            required: true,
            value: formData.contactNumber,
            onChange: handleFormInputChange
        },
        {
            name: "email",
            type: "email",
            placeholder: "Email ",
            required: true,
            value: formData.email,
            onChange: handleFormInputChange
        }
    ]

    return (
        <div className={cn("w-full p-2 text-xs flex h-full shadow-sm shadow-neutral-100 rounded-md", addAddressProps.className)}> 
            <Form 
                action={async() => {
                    Object.keys(errors).length == 0 && (await addAddress(formData), addAddressProps.onCancelClick())
                }} 
                className="space-y-3 "
            >
                { addressFormFields.map( (field, index) => {
                    return (
                    <div className="h-full flex flex-col relative">
                        <FormInputField
                            {...field}
                            key={index}
                            className={`text-neutral-800 h-full shadow-sm shadow-neutral-100 placeholder:text-neutral-600`}
                            readOnly={field.readonly}
                        ></FormInputField>
                        {
                           <p className="pl-3 text-[10px] md:text-xs z-40 text-red-400 absolute right-1 bottom-0">{errors[field.name as keyof FormErrorType]}</p>
                        }
                    </div>
                    )
                })}
                <div className="flex flex-row space-x-4 w-full px-4 justify-around">
                    {/* <div className="basis-1/2"> */}
                        <FormSubmitButton type="submit" className={` ${ Object.keys(errors).length != 0 && "cursor-not-allowed" } basis-1/2 py-2 text-xs bg-neutral-800 rounded-sm text-white hover:bg-neutral-900 hover:underline text-[11px]`} label={"ADD"}></FormSubmitButton>
                    {/* </div> */}
                    <GeneralButtonTransparent display="CANCEL" className="basis-1/2 p-2 text-[11px] rounded-sm" onClick={addAddressProps.onCancelClick}/>
                </div>
            </Form>
        </div>
    )
}