import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import { IconMinus, IconPlus } from "@tabler/icons-react";

interface decisionButtonProps {
    display: string,
    onClickFnc: () => void
}

interface generalButtonProps {
    display: string,
    onClick: () => void,
    className?: string
}

export const GeneralButton : React.FC<generalButtonProps> = ({display, onClick, className}) => {
    return (
        <button className={cn('rounded-md hover:bg-neutral-900 justify-center hover:underline text-xs p-2 text-white bg-neutral-800', className)} onClick={onClick}>
            {display}
        </button>
    )
};

interface generalButtonTransparentProps {
    display: string,
    onClick: () => void,
    className?: string
}

export const GeneralButtonTransparent : React.FC<generalButtonProps> = ({display, onClick, className}) => {
    return (
        <button className={cn('border bg-white rounded-sm justify-center border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-white', className)} onClick={onClick}>
            {display}
        </button>
    )
};

interface SidebarButtonProps extends LinkProps {
    display: string;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({ display, ...props}) => {
    return (
        <Link {...props} className="cursor-pointer flex justify-center flex-1 rounded-md p-3 black-white hover:bg-black hover:text-white hover:items-start">
            {display}
        </Link>
    )
}


interface sizeButtonProps {
    display: string,
    variantId: number,
    quantity: number,
    image:string,
    name: string,
    sku: string,
    price: number,
    selectedSize: any,
    productId: number,
    setSelectedSize: (selectedSize: {[variantId: number]: {
        productId: number;
        size: string;
        quantity: number;
        productSku: string,
        productImage: string;
        productName: string;
        price: number
    }}) => void,
    setQuantity: (quantity: number)=> void,
    sizeCount: number,
    key: number
}

export const SizeButton : React.FC<sizeButtonProps> = ({sizeCount, display, price, sku, quantity, variantId, selectedSize, name, image, setSelectedSize, setQuantity, productId}) => {
    if(quantity <= 0){
        return (    
            <GeneralButton display={display} onClick={()=>{}} className={`flex-1 bg-white justify-center flex rounded-md cursor-no-drop py-3 font-normal hover:bg-white hover:text-neutral-800 text-neutral-800 line-through`}/>
        )
    }
    return (
        variantId == selectedSize.current 
        ? <GeneralButton display={display} onClick={()=> setSelectedSize({[variantId] : {productId: productId, productSku: sku, price: price, size: display, quantity: quantity, productName:name, productImage:image}})} className={`flex-1 justify-center flex font-extrabold text-neutral-800 bg-white rounded-md py-3 hover:bg-white hover:text-neutral-800 hover:shadow-black/15 hover:shadow-md hover:no-underline`} />         
    : <GeneralButton display={display} onClick={()=> {setQuantity(1); selectedSize.current = variantId; setSelectedSize({[variantId] : {productId: productId, price: price, productSku: sku, size: display, quantity: quantity, productName:name, productImage:image}})}} className={`flex-1 bg-white justify-center flex rounded-md py-3 hover:shadow-md hover:bg-white text-neutral-700 hover:no-underline hover:text-neutral-800`}/>
    )
}

interface productPageActionButtonProps {
    display: string,
    onClick?: () => void,
    className?: string
}
export const ProductPageActionButton : React.FC<productPageActionButtonProps> = ({ display, onClick, className}) => (
    <div 
        className={cn("bg-white text-neutral-800 hover:bg-neutral-800 hover:text-white basis-1/2 flex justify-center p-3 cursor-pointer rounded-md shadow-none", className)}
        onClick={onClick}
    >{display}</div> 
)


interface quantitySelectButtonProps {
    selectedQuantity: number,
    onQuantityChange: ((newQuantity: number) => void) | ((newQuantity: number, productIdentifier: number) => void),
    minQuantity :number,
    maxQuantity: number,
    variantId?: number,
    className?: string,
    updatingQuantity?: boolean
}

export const QuantitySelectButton : React.FC<quantitySelectButtonProps> = ({selectedQuantity, minQuantity=1, maxQuantity, onQuantityChange, variantId, className, updatingQuantity}) => {
    console.log(selectedQuantity, minQuantity=1, maxQuantity, variantId)
    const handleDecrease = () => {
        if(selectedQuantity > minQuantity) {
            onQuantityChange.length == 1 && (onQuantityChange as (newQuantity: number) => void)(selectedQuantity-1);
            onQuantityChange.length == 2 && (onQuantityChange as (newQuantity: number, productIdentifier: number) => void)(selectedQuantity-1, variantId!);
        }
    };

    const handleIncrease = () => {
        if(selectedQuantity < maxQuantity) {
            onQuantityChange.length == 1 && (onQuantityChange as (newQuantity: number) => void)(selectedQuantity+1);
            onQuantityChange.length == 2 && (onQuantityChange as (newQuantity: number, productIdentifier: number) => void)(selectedQuantity+1, variantId!);
        }
    };

    return (
        <div className={cn(`flex basis-1/2 ${"bg-white bg-opacity-80 text-neutral-800" } p-3 rounded-md`, className)}>
            <div className="flex flex-row flex-1 justify-evenly rounded-md">
            {   
                updatingQuantity 
                ? 
                    <div className="flex items-center justify-center flex-grow font-bold"> ...</div>
                :
                <>
                    <button type="button" onClick={handleDecrease} className="flex items-center basis-1/3 justify-center cursor-pointer"> <IconMinus size={'12px'} /> </button>
                    <div className="flex items-center justify-center flex-grow font-normal text-neutral-600"> {selectedQuantity} </div>
                    <button type="button" onClick={handleIncrease} className="flex items-center basis-1/3 justify-center cursor-pointer text-sm"> <IconPlus size={'12px'} /> </button>
                </>
            }
            </div>
        </div>
    )
}