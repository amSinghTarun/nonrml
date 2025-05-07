"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { QuantitySelectButton, GeneralButton, GeneralButtonTransparent } from "./ui/buttons";
import { FileUpload } from "@nonrml/components";
import { Textarea } from "@/components/ui/textarea"
import { convertFileToDataURL } from "@nonrml/common";
import Checkbox from '@mui/material/Checkbox';
import { useRouter } from "next/navigation";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { convertStringToINR } from "@/lib/utils";

type OrderProduct = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];
type exchangeProduct = RouterOutput["viewer"]["product"]["getProductSizes"]["data"];

interface ExchangeProps {
    products: NonNullable<OrderProduct>["orderProducts"],
    orderId: string,
    returnAcceptanceDate: number,
    backToOrderDetails: () => void
}

export const MakeExchange : React.FC<ExchangeProps> = ({products, orderId, returnAcceptanceDate, backToOrderDetails}) => {
    const fetchExchangeProductSizes = trpc.useUtils().viewer.product.getProductSizes;
    const router = useRouter();
    const getExchangeProductSizes = async ( exchangeProducts: NonNullable<OrderProduct>["orderProducts"] ) => {
        const productIdsJson : { [productId: number] : 1 }= {};
        const productIds : number[] = []
        for(let exchangeProduct of exchangeProducts){
            //this to prevent duplicate product ids in productIds array, and peoduct id can be duplicate as variants of same product can be in 1 order
            if(!productIdsJson[exchangeProduct.productVariant.productId]){
                productIds.push(exchangeProduct.productVariant.productId);
            }
            productIdsJson[exchangeProduct.productVariant.productId] = 1;
        }
        let { data } = await fetchExchangeProductSizes.fetch(productIds);
        return data;
    };

    const initiateReturnOrder = trpc.viewer.return.initiateReturn.useMutation({
        onSuccess: (response) => {
            router.replace(`/exchanges/${response.data.orderId}`);
        }
    });

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
        setError({});
        let errors : { [productId: number]: string } = {};
        let productDetails : {
            orderId: string,
            products: { 
                orderProductId: number, 
                quantity:number, 
                referenceImage?:string,
                returnReason:string,
                exchangeVariant: number
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
            !selectedProducts[+productId].exchangeVariant && (errors = {...errors, [+productId]: "SELECT AN APPROPRIATE SIZE TO EXCHANGE WITH"});
            if(Object.keys(errors).length == 0){
                productDetails.products.push({
                    quantity: selectedProducts[+productId].quantity,
                    returnReason: selectedProducts[+productId].reason!,
                    ...(selectedProducts[+productId].referenceImage && {referenceImage: await convertFileToDataURL(selectedProducts[+productId].referenceImage!)}),
                    orderProductId: +productId,
                    exchangeVariant: selectedProducts[+productId].exchangeVariant!
                });
            }
        }
        if(Object.keys(errors).length > 0){
            setError(errors);
            return;
        }
        initiateReturnOrder.mutate({...productDetails, returnType: "REPLACEMENT"});
    }

    return(
        <div className="h-full flex flex-col justify-center">
            <div className="flex flex-row mb-5 items-center text-neutral-700 justify-between w-full">
                <div className=" transition-colors">
                    Exchange Items
                </div>
                <GeneralButtonTransparent 
                    onClick={backToOrderDetails} 
                    className="flex text-[10px] font-normal mt-2 p-1 flex-col "
                    display="GO BACK"
                />
            </div>
            <p className="text-xs text-neutral-500 mb-5 pl-1">Select item you wish to exchange</p>
            <p className="text-xs text-neutral-500 mb-5 pl-1">Exchange Available Untill {(new Date(returnAcceptanceDate)).toDateString()}</p>
            <div className="flex flex-col flex-1 space-y-3 mb-3">
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
                                            className="absolute cursor-pointer top-2 left-2"
                                        ><Checkbox defaultChecked color="default" className="text-white border-0 p-0 rounded-none" onClick={() => { removeSelectedProduct(product.id) }}/></button>
                                     :
                                        <button 
                                        className="absolute cursor-pointer top-2 left-2"
                                        disabled={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0)) ? false : true}
                                        > { 
                                            productExchangeSizes 
                                            ? <Checkbox className="text-white p-0 m-0 rounded-full hover:none" onClick={()=>setSelectedProducts({...selectedProducts, [product.id]: {quantity: 1}})} />
                                            : <Box sx={{ display: 'flex' }}> <CircularProgress size={20} className="text-white" /> </Box>
                                        } </button>
                                }
                                <div className="flex flex-col text-xs flex-grow space-y-3 pl-3 text-neutral-500">
                                    <p>{product.productVariant?.product.name.toUpperCase()}</p>
                                    <div className="flex flex-row justify-between">
                                        <p>Size: {product.productVariant?.size}</p>
                                        <p>{convertStringToINR(+product.price!)}</p>
                                    </div>
                                    { !selectedProducts[product.id] && <p className="font-bold text-neutral-600">Available For Exchange: {product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0) + (product.rejectedQuantity ?? 0))}</p>}
                                    { selectedProducts[product.id] && (
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-neutral-400">Exchange:</p>
                                            <QuantitySelectButton className="p-1 w-1/2 shadow-none text-xs" selectedQuantity={selectedProducts[product.id].quantity} minQuantity={1} maxQuantity={product.quantity - ((product.returnQuantity ?? 0) + (product.replacementQuantity ?? 0) + (product.rejectedQuantity ?? 0))} onQuantityChange={handleOnQuantityChange} variantId={product.id}/>
                                        </div>
                                    )}
                                </div>
                            </div>
                            { selectedProducts[product.id] &&
                                <div className="flex flex-col w-full space-y-2 mt-2">
                                    <div className="flex flex-row gap-3 w-full">
                                        {productExchangeSizes![product.productVariant.productId].map((productVariants, idx) => (
                                            productVariants.size != product.productVariant.size ? <GeneralButtonTransparent 
                                                display={productVariants.size} 
                                                onClick={()=>{ handleSizeChange(productVariants.variantId, product.id) }}
                                                className={`" flex w-full py-3 hover:shadow-md border-0 hover:text-neutral-800" ${(selectedProducts[product.id].exchangeVariant == productVariants.variantId) && "font-semibold text-neutral-800" }`}
                                            /> : <></>
                                        ))} 
                                    </div>
                                    <div className="flex flex-col lg:flex-row lg:gap-x-4 w-full space-y-4 lg:space-y-0">
                                        <FileUpload buttonClass="border border-neutral-200 text-neutral-400 bg-white hover:bg-white hover:text-neutral-700 " onFileDelete={deleteUploadedImage} onChange={handleImageUpload} orderProductId={product.id} /> 
                                        <Textarea className="text-xs border border-neutral-200 placeholder:text-neutral-400" onChange={(e)=>{handleReasonUpload(e.target.value, product.id)}} placeholder="Explain Your Issue In More Than 15 Words" /> 
                                    </div>
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
                        className="text-xs w-fit p-4" 
                        display={initiateReturnOrder.isLoading ? `Initiating Exchange...` : `EXCHANGE ${Object.values(selectedProducts).reduce((total, product) => total + product.quantity, 0)} Item`}
                        onClick={handleSubmit}
                    />
                </div>
            }
        </div>
    )
};