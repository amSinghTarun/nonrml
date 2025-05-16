"use client"

import React, { useState } from "react";
import Image from "next/image";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { GeneralButton, GeneralButtonTransparent, QuantitySelectButton } from "./ui/buttons";
import { FileUpload } from "@nonrml/components";
import { Textarea } from "@/components/ui/textarea"
import { convertFileToDataURL } from "@nonrml/common";
import Checkbox from '@mui/material/Checkbox';
import { ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { convertStringToINR } from "@/lib/utils";

type OrderProduct = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];

interface ReturnReplaceProps {
    products: NonNullable<OrderProduct>["orderProducts"],
    orderId: string,
    returnAcceptanceDate: number,
    backToOrderDetails: () => void
}

export const MakeReturn: React.FC<ReturnReplaceProps> = ({products, orderId, returnAcceptanceDate, backToOrderDetails}) => {

    const router = useRouter()
    const initiateReturnOrder = trpc.viewer.return.initiateReturn.useMutation({
        onSuccess: (response) => {
            router.replace(`/returns/${response.data.orderId}`);
        }
    });
    const [selectedProducts, setSelectedProducts] = useState<{
        [orderProductId: number]: { quantity: number, referenceImage?:File, reason?:string }
    }>({});
    const [error, setError] = useState<{[productId:number]: string}>({});

    const handleImageUpload = async (orderProductId: number, image: File) => {
        delete error[orderProductId]
        setError(error);
        setSelectedProducts({...selectedProducts, [orderProductId]: { ...selectedProducts[orderProductId] ,referenceImage: image}});
    };

    const deleteUploadedImage = (orderProductId: number) => {
        delete error[orderProductId]
        setError(error);
        delete selectedProducts[orderProductId].referenceImage;
        setSelectedProducts(selectedProducts);
    }

    const handleOnQuantityChange = (quantity: number, orderProductId:number) => {
        if(orderProductId in selectedProducts){
            console.log(quantity, orderProductId)
            setSelectedProducts({...selectedProducts, [orderProductId]: {...selectedProducts[orderProductId], quantity: quantity}});
        }
    };

    const removeSelectedProduct = (productId: number) => {
        delete error[productId]
        setError(error);
        setSelectedProducts(prevSelected => 
            Object.fromEntries(
                Object.entries(prevSelected).filter(([id]) => +id !== productId)
            )
        );
    };

    const handleReasonUpload = (text: string, orderProductId: number) => {
        setSelectedProducts({...selectedProducts, [orderProductId]: { ...selectedProducts[orderProductId] , reason: text}});
    }

    const handleSubmit = async () => {
        //console.log(Object.keys(selectedProducts));
        setError({});
        let errors : { [productId: number]: string } = {};
        let productDetails : {
            orderId: string,
            products: { 
                orderProductId: number, 
                quantity:number, 
                referenceImage?:string,
                returnReason:string
            }[]
        } = {orderId: orderId, products: []}
        for(let productId of Object.keys(selectedProducts)){
            // !selectedProducts[+productId].referenceImage && (errors = {...errors, [+productId]: "PLEASE UPLOAD A RELATED IMAGE"});
            !selectedProducts[+productId].reason ? (
                errors[+productId] ? ( errors = {...errors, [+productId]: "PLEASE UPLOAD A RELATED IMAGE AND EXPLAIN YOUR REASON"})
                : (errors = {...errors, [+productId]: "PLEASE EXPLAIN YOUR ISSUE( more than 15 words)"})
            ) : (
                selectedProducts[+productId].reason!.length < 15 && (errors = {...errors, [+productId]: "PLEASE EXPLAIN YOUR ISSUE IN MORE THAN 15 WORDS"})
            )
            if(Object.keys(errors).length == 0){
                productDetails.products.push({
                    quantity: selectedProducts[+productId].quantity,
                    returnReason: selectedProducts[+productId].reason!,
                    ...(selectedProducts[+productId].referenceImage && {referenceImage: await convertFileToDataURL(selectedProducts[+productId].referenceImage!)}),
                    orderProductId: +productId
                });
            }
        }
        if(Object.keys(errors).length > 0){
            setError(errors);
            return;
        }
        // //console.log(productDetails);
        initiateReturnOrder.mutateAsync(productDetails);
    }

    return(
        <div className="h-full flex flex-col justify-center">
            <div className="flex flex-row mb-5 items-center text-neutral-700 justify-between w-full">
                <div className=" rounded-full transition-colors">
                    Return Items
                </div>
                < GeneralButtonTransparent 
                    onClick={backToOrderDetails} 
                    className="flex text-[10px] font-normal mt-2 p-1 flex-col "
                    display="GO BACK"
                />
            </div>
            <p className="text-xs text-neutral-500 mb-5 pl-1">Select item you wish to return</p>
            <p className="text-xs text-neutral-500 mb-5 pl-1">Return Available Untill {(new Date(returnAcceptanceDate)).toDateString()}</p>
            <div className="flex flex-col flex-1 space-y-3 overflow-y-scroll mb-3  ">
                { products.map((product, index) => {
                    return ( 
                        <div 
                            key={index}
                            className={`relative justify-between flex flex-col text-xs p-1`}
                        >
                            <div className="flex w-full flex-row">
                                <Image src={`${product.productVariant?.product.productImages[0].image}`} alt="product image" className="h-28 w-auto object-cover rounded-md" width={10} height={10} sizes="100vw"/>
                                {
                                    selectedProducts[product.id] ? 
                                        <button 
                                            className=" absolute cursor-pointer top-2 left-2  "
                                        ><Checkbox defaultChecked color="default" className=" text-white border p-0 rounded-none" onClick={() => { removeSelectedProduct(product.id) }}/></button>
                                     : 
                                        <button 
                                            className=" absolute cursor-pointer top-2 left-2"
                                            disabled={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0)) ? false : true}
                                        ><Checkbox className=" text-white  p-0 m-0 rounded-full hover:none" onClick={()=>setSelectedProducts({...selectedProducts, [product.id]: {quantity: product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0) + (product.rejectedQuantity ?? 0))}})} /></button>
                                }
                                <div className="flex flex-col text-xs flex-grow space-y-3 pl-3 text-neutral-500">
                                    <p>{product.productVariant?.product.name.toUpperCase()}</p>
                                    <div className="flex flex-row justify-between">
                                        <p>Size: {product.productVariant?.size}</p>
                                        <p>{convertStringToINR(+product.price!)}</p>
                                    </div>
                                    { !selectedProducts[product.id] && <p className="font-bold text-neutral-600">Available For Return: {product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0) + (product.rejectedQuantity ?? 0))}</p>}
                                    { selectedProducts[product.id] && (
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-neutral-400">Return:</p>
                                            <QuantitySelectButton className="p-1 w-1/2 shadow-none text-xs" selectedQuantity={selectedProducts[product.id].quantity} minQuantity={1} maxQuantity={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0) + (product.rejectedQuantity ?? 0))} onQuantityChange={handleOnQuantityChange} variantId={product.id}/>
                                        </div>
                                    )}
                                </div>
                            </div>
                            { selectedProducts[product.id] && 
                                <div className="flex flex-col w-full lg:space-y-0 space-y-4 lg:flex-row lg:gap-x-4 mt-2">
                                    <FileUpload buttonClass="border border-neutral-200 text-neutral-400 bg-white hover:bg-white hover:text-neutral-700" onFileDelete={deleteUploadedImage} onChange={handleImageUpload} orderProductId={product.id} /> 
                                    <Textarea className="text-xs border border-neutral-200 placeholder:text-neutral-400" onChange={(e)=>{handleReasonUpload(e.target.value, product.id)}} placeholder="Explain Your Issue In More Than 15 Words" /> 
                                </div>
                            } 
                        {error[product.id] && <div key={product.id} className="text-xs text-red-600 pl-5">{error[product.id]}</div>}
                        </div> 
                    )
                })}
            </div>
            
            { Object.keys(selectedProducts).length > 0 && 
                <div className="flex justify-center">
                    <GeneralButton 
                        className=" text-xs w-fit p-4" 
                        display={initiateReturnOrder.isLoading ? "Initiating Return..." : `RETURN ${Object.values(selectedProducts).reduce((total, product) => total + product.quantity, 0)} Item`}
                        onClick={handleSubmit}
                    />
                </div>
            }

        </div>
    )
};