"use server"

import { TRPCClientError } from "@trpc/client";
import { serverClient } from "@/app/_trpc/serverClient";

export const trackOrder = async ({orderId, mobile}:{orderId: string, mobile:string}) => {
    let customError = false;
    try{
        const order = await (await serverClient()).viewer.orders.trackOrder({orderId: orderId, mobile: mobile});
        // redirect to the tracking page
    } catch (error) {
        throw error
    }
}