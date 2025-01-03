import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";

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
        <button className={cn('rounded-xl hover:bg-black hover:text-white shadow-black bg-white/20 shadow-sm ', className)} onClick={onClick}>
            {display}
        </button>
    )
};

interface SidebarButtonProps extends LinkProps {
    display: string;
}

export const SidebarButton: React.FC<SidebarButtonProps> = ({ display, ...props}) => {
    return (
        <Link {...props} className="hover:cursor-pointer flex justify-center flex-1 rounded-xl p-3 black-white hover:bg-black hover:text-white hover:items-start">
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
            <GeneralButton display={display} onClick={()=>{}} className={`basis-1/${sizeCount} bg-white bg-opacity-50 justify-center flex rounded-xl pt-3 pb-3 font-medium shadow-black/15 backdrop-blur-3xl text-black line-through`}/>
        )
    }
    return (
        variantId == selectedSize.current 
        ? <button onClick={()=> setSelectedSize({[variantId] : {productId: productId, productSku: sku, price: price, size: display, quantity: quantity, productName:name, productImage:image}})} className={`basis-1/${sizeCount-1} justify-center flex rounded-xl pt-3 pb-3 bg-black text-white`}>
                {display}
            </button>
    : <GeneralButton display={display} onClick={()=> {setQuantity(1); selectedSize.current = variantId; setSelectedSize({[variantId] : {productId: productId, price: price, productSku: sku, size: display, quantity: quantity, productName:name, productImage:image}})}} className={` basis-1/${sizeCount} bg-white bg-opacity-50 justify-center flex rounded-xl py-3 font-medium shadow-black/15 backdrop-blur-3xl text-black`}/>
    )
}

interface productPageActionButtonProps {
    display: string,
    onClick?: () => void,
    className?: string
}
export const ProductPageActionButton : React.FC<productPageActionButtonProps> = ({ display, onClick, className}) => (
    <div 
        className={cn("bg-white text-black hover:bg-black hover:text-white basis-1/2 flex justify-center p-3 font-semibold hover:cursor-pointer rounded-xl  hover:font-semibold bg-opacity-50 shadow shadow-black/15 backdrop-blur-3xl", className)}
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
    console.log(selectedQuantity, minQuantity=1, maxQuantity, onQuantityChange, variantId, className, updatingQuantity)
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
        <div className={cn(`flex basis-1/2 ${onQuantityChange.length == 2 ? "bg-black text-white" : "bg-white bg-opacity-50 shadow-sm shadow-black/10 text-black" } p-3 rounded-xl`, className)}>
            <div className="flex flex-row flex-1 justify-evenly rounded-xl">
            {   
                updatingQuantity 
                ? 
                    <div className="flex items-center justify-center flex-grow font-medium"> ...</div>
                :
                <>
                    <button onClick={handleDecrease} className="flex items-center basis-1/6 justify-center  hover:cursor-pointer rounded-l-xl pl-4 pr-3"> - </button>
                    <div className="flex items-center justify-center flex-grow font-medium"> {selectedQuantity} </div>
                    <button onClick={handleIncrease} className="flex items-center basis-1/6 justify-center hover:cursor-pointer rounded-r-xl pr-4 pl-3"> + </button>
                </>
            }
            </div>
        </div>
    )
}