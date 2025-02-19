import { cn } from "@/lib/utils";
import React from "react";
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';

interface AddressCardProps {
    name: string,
    email: string,
    address: string,
    mobile: string | number,
    className?:string,
    onEdit: () => void,
    onSelect: (id: number) => void,
    onDelete: () => void,
    id: number,
    pincode: string,
    selected: number | undefined
}

export const AddressCard : React.FC<AddressCardProps> = ({name, selected, id, email, address, mobile, className, pincode, onDelete, onEdit, onSelect}) => {
    return (
        <div 
            className={cn(" backdrop-blur-3xl flex flex-col text-sm shadow-sm shadow-black/15 p-2 rounded-xl cursor-pointer", className)}
        >
            <div className="flex flex-row" onClick={()=> onSelect(id)}>{`${name.toLocaleUpperCase()}, ${address}, ${pincode}`}</div>
            <div className="flex flex-row" onClick={()=> onSelect(id)}>{email}</div>
            <div className="flex flex-row justify-between pt-1">
                <div onClick={()=> onSelect(id)}  >{mobile}</div>
                <div className=" bg-red-400 gap-x-4 flex flex-row">
                    <div className="basis-1/2 cursor-pointer" onClick={onEdit}><EditNoteIcon/></div>
                    {  (selected != id) && <button className="basis-1/2 cursor-pointer" onClick={onDelete}><DeleteIcon className=" p-[3px]"/></button>}
                </div>
            </div>
        </div>
    )
}