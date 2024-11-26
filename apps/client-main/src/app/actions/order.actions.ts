"use server"

import { getSession } from "@nonrml/configs";
import { serverClient } from "../_trpc/serverClient"
import { RouterInput } from "../_trpc/client";

type TOrderProducts = RouterInput["viewer"]["orders"]["initiateOrder"];
type TInitiateReturn = RouterInput["viewer"]["return"]["initiateReturn"];

export const initiateOrder = async ({orderProducts, addressId, creditNoteCode}: TOrderProducts) => {
    // const session = await getSession();
    // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
    const { data } = await (await serverClient()).viewer.orders.initiateOrder({
        orderProducts: orderProducts,
        addressId: addressId,
        creditNoteCode: creditNoteCode
    });
    return data;
}

export const InitiateReturnOrder = async (returnOrder: TInitiateReturn) => {
    // const session = await getSession();
    // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
    const { data } = await (await serverClient()).viewer.return.initiateReturn(returnOrder);
    return data;
}

// export const InitiateExchangeOrder = async (returnOrder: TInitiateReturn) => {
    // const session = await getSession();
    // if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
//     const { data } = await (await serverClient()).viewer.return.initiateReturn(returnOrder);
//     return data;
// }