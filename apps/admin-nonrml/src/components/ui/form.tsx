import { cn } from "@nonrml/common";
import React, { ReactNode, FormHTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes  } from "react";
import { useFormStatus } from "react-dom";

interface FormProps extends FormHTMLAttributes<HTMLFormElement>{
    children: ReactNode,
    className?: string
};
export const Form : React.FC<FormProps> = ({ children, className, ...props }) => {
    return (
        <form {...props} className={cn("w-[100%] flex flex-col space-y-3", className)}>
            {children}
        </form>
    )
};

interface FormField extends InputHTMLAttributes<HTMLInputElement> {
   className?: string 
};
export const FormInputField : React.FC<FormField> = ({className, ...props}) => {
    return (
        <input className={cn("text-white flex bg-stone-700 rounded-xl p-3 outline-none placeholder:text-white/70 read-only", className)} {...props}/>
    )
};

interface FormSubmitButton extends ButtonHTMLAttributes<HTMLButtonElement>{
    label: string,
    className?: string,
};
export const FormSubmitButton : React.FC<FormSubmitButton> = ({label, className, ...props}) => {
    const { pending } = useFormStatus();
    return (
        <button 
            disabled={pending} 
            className={cn(' w-full text-white hover:bg-white hover:text-black rounded-xl bg-stone-700', className)}
            {...props}
        >
            {pending ? "SAVING..." : label }
        </button>
    )
};
