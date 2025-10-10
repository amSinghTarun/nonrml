"use client"
import { trpc } from "@/app/_trpc/client";
import { Form, FormInputField, FormSubmitButton } from "@/components/ui/form"
import { cn } from "@nonrml/common"
import { useState } from "react";
import { X } from "lucide-react";

interface TrackOrderProps {
    className?: string
};

interface TrackingData {
    orderId: string;
    AWB?: string;
    trackingLink: string;
    orderStatus: string;
}

export const TrackOrder: React.FC<TrackOrderProps> = (trackOrderProps) => {
    const [formData, setFormData] = useState<{orderId: string, mobile:string}>({orderId:"", mobile:""})
    const [error, setError] = useState<string|null>(null);
    const [formError, setFormError] = useState<string|null>(null);
    const [showModal, setShowModal] = useState(false);
    const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Call hooks at the top level
    const trpcTrackOrder = trpc.useUtils().viewer.orders.trackOrder;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault();
        setError(null);
        setFormError(null);
        let {name, value} = e.target;
        let setNewFormData = true;
        if(name == "mobile"){
            // Remove +91 prefix if present to handle the value
            value = value.replace(/^\+91/, "");
            // Remove all non-digits
            value = value.replace(/[\D\s]/g, "");
            setNewFormData = value.length <= 10;
        }
        setNewFormData && setFormData({...formData, [name]:value});
    };
    
    const handleSubmit = async () => {
        try{
            setIsLoading(true);
            if(formData.mobile.length < 10 || !/^[6-9]\d{9}$/g.test(formData.mobile)){
                setFormError("Please enter a valid 10 digit mobile number");
                setIsLoading(false);
                return;
            }
            const trackData = await trpcTrackOrder.fetch({orderId: formData.orderId, mobile: formData.mobile});
            
            if(trackData) {
                setTrackingData({
                    orderId: `ORD-${trackData.data.id}${trackData.data.idVarChar}`,
                    ...(trackData.data.shipment?.AWB && {AWB: trackData.data.shipment?.AWB}),
                    trackingLink: trackData.data.shipment?.AWB ? `https://shiprocket.co/tracking/${trackData.data.shipment?.AWB}` : `https://my.shiprocket.in/#/login`,
                    orderStatus: trackData.data.orderStatus
                });
                setShowModal(true);
            }
        } catch(error: any){
            setError(error.message)
        } finally {
            setIsLoading(false);
        }
    };
    
    const closeModal = () => {
        setShowModal(false);
        setTrackingData(null);
    };
    
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if(statusLower.includes('delivered')) return 'text-green-600';
        if(statusLower.includes('shipped') || statusLower.includes('transit')) return 'text-blue-600';
        if(statusLower.includes('processing') || statusLower.includes('preparing')) return 'text-yellow-600';
        if(statusLower.includes('cancelled') || statusLower.includes('failed')) return 'text-red-600';
        return 'text-neutral-600';
    };
    
    return (
        <>
            <div className={cn("w-[90%] text-neutral-800 flex flex-col text-center text-xs", trackOrderProps.className)}>
                <h1 className="flex justify-center text-neutral-800 font-bold place-items-end basis-1/3 text-xl mb-1">
                    TRACK ORDER
                </h1>
                <p className="mb-10 sm:text-xs text-[10px] text-neutral-500">Enter The Mobile Used In Shipping Address Of Respective Order</p>
                <Form 
                    className="flex justify-center text-sm items-center px-10"
                    action={handleSubmit}
                >
                    <FormInputField 
                        name="orderId"
                        value={formData?.orderId}
                        onChange={handleChange}
                        className="bg-white p-5 placeholder:text-xs rounded-md shadow-sm shadow-neutral-200 text-neutral-800 placeholder:text-neutral-500 w-full"
                        placeholder="Order Id"
                    />
                    <div className="relative w-full">
                        <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-800 text-xs font-medium">+91</span>
                        <FormInputField
                            name="mobile"
                            value={formData?.mobile}
                            onChange={handleChange}
                            className="bg-white p-5 pl-12 placeholder:text-xs rounded-md shadow-sm shadow-neutral-200 text-neutral-800 placeholder:text-neutral-500 w-full"
                            placeholder="Mobile Number"
                            maxLength={10}
                        />
                    </div>
                    {
                        <p className="text-red-500 text-xs pl-3">{formError || error}</p>
                    } 
                    <FormSubmitButton 
                        type="submit"
                        label={isLoading ? "TRACKING..." : "TRACK ORDER"}
                        disabled={isLoading}
                        className="w-fit p-5 text-xs font-bold bg-neutral-800 hover:underline hover:text-white hover:bg-neutral-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </Form>
            </div>
            
            {/* Modal */}
            {showModal && trackingData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={closeModal}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-sm shadow-xl max-w-md w-[90%] mx-4 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-bold text-neutral-800">Order Tracking Details</h2>
                            <button
                                onClick={closeModal}
                                className="p-1 rounded-full hover:bg-neutral-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            {/* Order ID */}
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Order ID</p>
                                <p className="font-semibold text-neutral-800">{trackingData.orderId}</p>
                            </div>
                            
                            {/* Order Status */}
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">Status</p>
                                <p className={"font-semibold capitalize"}>
                                    {trackingData.orderStatus}
                                </p>
                            </div>
                            
                            {/* Waybill Number */}
                            {trackingData.AWB && (
                                <div>
                                    <p className="text-xs text-neutral-500">AWB</p>
                                    <p className="font-semibold text-neutral-800">{trackingData.AWB}</p>
                                </div>
                            )}
                            
                            {/* Track Package Button */}
                            {trackingData.trackingLink && (
                                <div className="pt-2">
                                    <a
                                        href={trackingData.trackingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center py-3 px-4 bg-neutral-800 text-white font-semibold text-sm rounded-md hover:bg-neutral-900 transition-colors"
                                    >
                                        Track Package →
                                    </a>
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-neutral-50 rounded-b-lg">
                            <p className="text-xs text-neutral-500 text-center">
                                For support, contact{' '}
                                <a href={`mailto:${process.env.CLIENT_SUPPORT_MAIL}`} className="text-neutral-800 underline">
                                    {process.env.CLIENT_SUPPORT_MAIL}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
};