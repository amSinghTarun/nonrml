"use client"

import React, { useState } from "react";
import Image from "next/image";
import { RouterOutput, trpc } from "@/app/_trpc/client";
import { GeneralButton, GeneralButtonTransparent, QuantitySelectButton } from "./ui/buttons";
import { FileUpload } from "@nonrml/components";
import { Textarea } from "@/components/ui/textarea"
import { convertFileToDataURL } from "@nonrml/common";
import Checkbox from '@mui/material/Checkbox';
import { useRouter } from "next/navigation";
import { convertStringToINR } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type OrderProduct = RouterOutput["viewer"]["orders"]["getUserOrder"]["data"];

interface ReturnReplaceProps {
    products: NonNullable<OrderProduct>["orderDetails"]["orderProducts"],
    orderId: number,
    returnAcceptanceDate: number,
    backToOrderDetails: () => void
}

export const MakeReturn: React.FC<ReturnReplaceProps> = ({products, orderId, returnAcceptanceDate, backToOrderDetails}) => {

    const router = useRouter()
    const { toast } = useToast()
    const initiateReturnOrder = trpc.viewer.return.initiateReturn.useMutation({
        onSuccess: (response) => {
            toast({
                title: "Return Initiated Successfully",
                description: "Your return request has been submitted and is being processed.",
            })
            router.replace(`/returns/${response.data.orderId}`);
        },
        onError: (error) => {
            toast({
                variant: "destructive",
                title: "Failed to Initiate Return",
                description: error.message || "Something went wrong. Please try again.",
            })
        }
    });

    const [selectedProducts, setSelectedProducts] = useState<{
        [orderProductId: number]: { quantity: number}
    }>({});

    const [refImageAndReason, setRefImageAndReason] = useState<{
        referenceFiles: File[],
        description: string
    }>({referenceFiles: [], description: ""});

    const [error, setError] = useState<{[productId:number]: string}>({});

    const handleFileUpload = (files: File[]) => {
        if (files.length > 5) {
            toast({
                variant: "destructive",
                title: "Too Many Files",
                description: "You can upload a maximum of 5 files. Please remove some files and try again.",
            })
            return;
        }

        // Check for invalid file types (this is additional validation)
        const invalidFiles = files.filter(file => !file.type.startsWith('image/') && !file.type.startsWith('video/'));
        if (invalidFiles.length > 0) {
            toast({
                variant: "destructive",
                title: "Invalid File Type",
                description: "Only image and video files are allowed. Please upload valid files.",
            })
            return;
        }

        setRefImageAndReason(prev => ({
            ...prev,
            referenceFiles: files
        }));

        if (files.length > 0) {
            toast({
                title: "Files Uploaded Successfully",
                description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully.`,
            })
        }
    };

    const handleFileDelete = (deletedIndex: number) => {
        toast({
            title: "File Removed",
            description: "File has been successfully removed from your upload.",
        })
        console.log(`File at index ${deletedIndex} was deleted`);
    };

    const handleDescriptionChange = (description: string) => {
        setRefImageAndReason(prev => ({
            ...prev,
            description: description
        }));
    };

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
        
        toast({
            title: "Product Removed",
            description: "Product has been removed from your return request.",
        })
    };

    const handleSubmit = async () => {
        setError({});
        let errors : { [productId: number]: string } = {};
        
        // Validate that at least one product is selected
        if (Object.keys(selectedProducts).length === 0) {
            toast({
                variant: "destructive",
                title: "No Products Selected",
                description: "Please select at least one product for return.",
            })
            return;
        }

        // Validate that at least one file is uploaded
        if (refImageAndReason.referenceFiles.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Evidence",
                description: "Please upload at least one image or video to describe your issue.",
            })
            return;
        }

        // Validate description
        if (!refImageAndReason.description || refImageAndReason.description.trim().length < 15) {
            toast({
                variant: "destructive",
                title: "Description Too Short", 
                description: "Please provide a detailed description (at least 15 characters) of your issue.",
            })
            return;
        }

        try {
            // Convert all files to data URLs
            let images : string[] = []
            for(let image of refImageAndReason.referenceFiles){
                const imageURL = await convertFileToDataURL(image)
                console.log("the image URL", imageURL)
                images.push(imageURL);
            }

            console.log(images)
            
            let productDetails : {
                orderId: number,
                referenceImages: string[],
                returnReason: string
                products: { 
                    orderProductId: number, 
                    quantity: number, 
                }[]
            } = { 
                orderId: orderId, 
                referenceImages: images,
                returnReason: refImageAndReason?.description, 
                products: []
            }

            for(let productId of Object.keys(selectedProducts)){
                if(Object.keys(errors).length == 0){
                    productDetails.products.push({
                        quantity: selectedProducts[+productId].quantity,
                        orderProductId: +productId
                    });
                }
            }

            if(Object.keys(errors).length > 0){
                setError(errors);
                return;
            }

            await initiateReturnOrder.mutateAsync(productDetails);
            
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Processing Error",
                description: "Failed to process your files. Please try again or contact support.",
            })
        }
    }

    return(
        <div className="h-full flex flex-col justify-center">
            <div className="flex flex-row mb-5 items-center text-neutral-700 justify-between w-full">
                <div className=" rounded-full transition-colors">
                    Return Damaged Shipment
                </div>
                <GeneralButtonTransparent 
                    onClick={backToOrderDetails} 
                    className="flex text-[10px] font-normal mt-2 p-1 flex-col "
                    display="GO BACK"
                />
            </div>
            <p className="text-xs text-neutral-500 mb-2 pl-1">Select item you wish to raise request for</p>
            <p className="text-xs text-neutral-500 mb-5 pl-1">Available for 24 Hours From Delivery</p>
            
            <div className="flex flex-col w-full space-y-4 mt-2 mb-5">
                <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-medium">
                        Upload Evidence (Images/Videos) - Max 5 files
                    </label>
                    <FileUpload 
                        buttonClass="border border-neutral-200 text-neutral-400 bg-white hover:bg-white hover:text-neutral-700" 
                        onUpload={handleFileUpload}
                        onFileDelete={handleFileDelete}
                        maxFiles={5}
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-neutral-600 font-medium">
                        Describe Your Issue (Required - Min 15 characters)
                    </label>
                    <Textarea 
                        className="text-xs border border-neutral-200 placeholder:text-neutral-400" 
                        onChange={(e) => handleDescriptionChange(e.target.value)} 
                        placeholder="Explain your issue in detail. Include what went wrong, when it happened, and any other relevant information..."
                        rows={4}
                        value={refImageAndReason.description}
                    />
                </div>
            </div>

            <div className="flex flex-col flex-1 space-y-3 overflow-y-scroll mb-3">
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
                        {error[product.id] && <div key={product.id} className="text-xs text-red-600 pl-5">{error[product.id]}</div>}
                        </div> 
                    )
                })}
            </div>
            
            { Object.keys(selectedProducts).length > 0 && 
                <div className="flex justify-center">
                    <GeneralButton 
                        className=" text-xs w-fit p-4" 
                        display={initiateReturnOrder.isLoading ? "Raising Issuee..." : `Raise Issue`}
                        onClick={handleSubmit}
                    />
                </div>
            }
        </div>
    )
};