"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RouterOutput } from "@/app/_trpc/client";
import { QuantitySelectButton, GeneralButton } from "./ui/buttons";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea"
import { InitiateReturnOrder } from "@/app/actions/order.actions";
import { convertFileToDataURL } from "@nonrml/common";
import Checkbox from '@mui/material/Checkbox';
import { getExchangeProductSizes } from "@/app/actions/product.action";

type OrderProduct = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];
type exchangeProduct = RouterOutput["viewer"]["product"]["getProductSizes"]["data"];

interface ExchangeProps {
    makeNewExchange: boolean,
    products: NonNullable<OrderProduct>["orderProducts"],
    orderId: string,
    backToOrderDetails: () => void
}

export const MakeExchange : React.FC<ExchangeProps> = ({makeNewExchange, products, orderId, backToOrderDetails}) => {
    const [selectedProducts, setSelectedProducts] = useState<{
        [orderProductId: number]: { exchangeVariant?:number, quantity: number, referenceImage?:File, reason?:string }
    }>({});
    const [error, setError] = useState<{[productId:number]: string}>({});
    const [productExchangeSizes, setProductExchangeSizes] = useState<exchangeProduct>();

    const handleImageUpload = async (orderProductId: number, image: File) => {
        delete error[orderProductId]
        setError(error);
        setSelectedProducts({...selectedProducts, [orderProductId]: { ...selectedProducts[orderProductId] ,referenceImage: image}});
    };

    useEffect( () => {
        getExchangeProductSizes(products)
            .then(products => { setProductExchangeSizes(products)} )
            .catch(error => { throw error})
    }, []);

    const deleteUploadedImage = (orderProductId: number) => {
        delete error[orderProductId]
        setError(error);
        delete selectedProducts[orderProductId].referenceImage;
        setSelectedProducts(selectedProducts);
    }

    const handleOnQuantityChange = (quantity: number, orderProductId:number) => {
        if(orderProductId in selectedProducts){
            setSelectedProducts({...selectedProducts, [orderProductId]: {...selectedProducts[orderProductId], quantity: quantity}});
        }
    };
    
    const handleSizeChange = (variantId: number, orderProductId:number) => {
        if(orderProductId in selectedProducts){
            setSelectedProducts({...selectedProducts, [orderProductId]: {...selectedProducts[orderProductId], exchangeVariant: variantId}});
        }
    }

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
                referenceImage:string,
                returnReason:string,
                exchangeVariant: number
            }[]
        } = {orderId: orderId, products: []}
        for(let productId of Object.keys(selectedProducts)){
            !selectedProducts[+productId].referenceImage && (errors = {...errors, [+productId]: "PLEASE UPLOAD A RELATED IMAGE"});
            !selectedProducts[+productId].reason ? (
                errors[+productId] ? ( errors = {...errors, [+productId]: "PLEASE UPLOAD A RELATED IMAGE AND EXPLAIN YOUR REASON"})
                : (errors = {...errors, [+productId]: "PLEASE EXPLAIN YOUR ISSUE( more than 15 words)"})
            ) : (
                selectedProducts[+productId].reason!.length < 15 && (errors = {...errors, [+productId]: "PLEASE EXPLAIN YOUR ISSUE IN MORE THAN 15 WORDS"})
            )
            !selectedProducts[+productId].exchangeVariant && (errors = {...errors, [+productId]: "SELECT AN APPROPRIATE SIZE TO EXCHANGE WITH"});
            if(Object.keys(errors).length == 0){
                productDetails.products.push({
                    quantity: selectedProducts[+productId].quantity,
                    returnReason: selectedProducts[+productId].reason!,
                    referenceImage: await convertFileToDataURL(selectedProducts[+productId].referenceImage!),
                    orderProductId: +productId,
                    exchangeVariant: selectedProducts[+productId].exchangeVariant!
                });
            }
        }
        if(Object.keys(errors).length > 0){
            setError(errors);
            return;
        }
        InitiateReturnOrder({...productDetails, returnType: "REPLACEMENT"});
    }

    return(
        <div className="h-full flex flex-col">
            <div className="flex flex-row mb-1 items-center">
                <h1 className="flex flex-grow text-2xl font-bold p-1">Exchange(s)</h1>
                <button className="h-[70%] text-xs font-medium text-black rounded-xl px-3 bg-transparent shadow-sm shadow-black" onClick={backToOrderDetails}>SHOW ORDER</button>
            </div>
            <div className="flex flex-col flex-1 space-y-3 overflow-y-scroll mb-3">
                { !makeNewExchange &&     
                    <div className="flex-1 flex justify-center text-center items-center">
                        <div className="text-sm rounded-xl bg-red-200 text-center px-3 py-2" >Can't make a new exchange unless last one is Accepted or Rejected.</div> 
                    </div>
                }
                { makeNewExchange && products.map((product, index) => {
                return ( 
                    <div key={index} className="space-y-0.5">
                    <div 
                        className={`relative justify-between backdrop-blur-3xl flex flex-col text-xs shadow-sm shadow-black/15 p-1 rounded-xl`}
                    >
                        <div className="flex w-full flex-row space-x-3">
                            <Image src={`${product.productVariant?.product.productImages[0].image}`} alt="product image" width={70} height={50} sizes="100vw"/>
                            <div className="flex flex-col flex-grow justify-around">
                                <p>{product.productVariant?.product.name.toUpperCase()}</p>
                                <p>Size: {product.productVariant?.size}</p>
                                { !selectedProducts[product.id] && <p>Available For Exchange: {product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0))}</p>}
                                { selectedProducts[product.id] && (
                                    <div className="flex flex-row space-x-3">
                                        <p>Exchange:</p>
                                        <QuantitySelectButton className="p-1 bg-white/10 text-black" selectedQuantity={selectedProducts[product.id].quantity} minQuantity={1} maxQuantity={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0))} onQuantityChange={handleOnQuantityChange} variantId={product.id}/>
                                    </div>
                                )}
                            </div>
                            {
                                selectedProducts[product.id] ? 
                                    <button 
                                        className="rounded-xl flex hover:cursor-default"
                                    ><Checkbox color="warning" onClick={() => { removeSelectedProduct(product.id) }}/></button>
                                : (
                                    productExchangeSizes && <button 
                                        className="rounded-xl flex hover:cursor-default"
                                        disabled={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0)) ? false : true}
                                    ><Checkbox color="warning" onClick={()=>setSelectedProducts({...selectedProducts, [product.id]: {quantity: product.quantity}})} /></button>
                                )
                            }
                        </div>
                        { selectedProducts[product.id] && 
                            <div className="flex flex-col w-full space-y-2 text-xs">
                                <div className="flex flex-row pt-3 gap-3">
                                    {productExchangeSizes![product.productVariant.productId].map( productVariants => (
                                        <div className={`${(selectedProducts[product.id].exchangeVariant == productVariants.variantId) ? "text-white bg-black" : "text-black bg-white bg-opacity-50" } text-xs basis-1/${productExchangeSizes![product.productVariant.productId].length} py-2 text-center shadow-black/15 shadow-sm rounded-xl cursor-pointer hover:bg-black hover:text-white)`}
                                        onClick={()=>{ handleSizeChange(productVariants.variantId, product.id) }}
                                        >{productVariants.size}</div>
                                    ))} 
                                </div>
                                <FileUpload onFileDelete={deleteUploadedImage} onChange={handleImageUpload} orderProductId={product.id} /> 
                                <Textarea onChange={(e)=>{handleReasonUpload(e.target.value, product.id)}} placeholder="please explain your reasoning using more than 15 words." /> 
                            </div>
                        } 
                    </div> 
                    {error[product.id] && <div key={product.id} className="text-xs text-red-600 pl-5">{error[product.id]}</div>}
                    </div>
                    )

                } ) }
            </div>
            { Object.keys(selectedProducts).length > 0 && <div className="flex flex-row h-14 justify-between">
                <div className="flex flex-col basis-1/3">
                    <div className="text-xs">EXCHANGE :</div>
                    <div className="text-xl">{Object.values(selectedProducts).reduce((total, product) => total + product.quantity, 0)} Item(s)</div>
                </div>
                <div className="basis-2/3">
                    <GeneralButton 
                        className=" h-full w-full backdrop-blur-3xl bg-black text-white hover:bg-white hover:text-black hover:shadow-sm hover:shadow-black font-medium" 
                        display="PROCEED" 
                        onClick={handleSubmit}
                    />
                </div>
            </div> }
        </div>
    )
};