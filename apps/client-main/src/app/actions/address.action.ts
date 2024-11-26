"use server"
import { serverClient } from "@/app/_trpc/serverClient";
import { getSession } from "@nonrml/configs";
import { RouterInput } from "@/app/_trpc/client";
import { revalidatePath } from "next/cache";

export const deleteAddress = async (id: number) => {
    try{
        // const session = await getSession();
        // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");
        //this should come from the backend, this login first thing
        await (await serverClient()).viewer.address.removeAddress({id: id});
    } catch (error) {
        throw error
    }
}

type AddAddressInput = RouterInput["viewer"]["address"]["addAddress"]
export const addAddress = async (formData: AddAddressInput) => {
    try{
        // const session = await getSession();
        // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");
        const address = await (await serverClient()).viewer.address.addAddress({...formData, city:"bsp", state:"cg"});
        revalidatePath("/checkout")
    } catch(error) {
        throw error;
    }
}

type EditAddressInput = RouterInput["viewer"]["address"]["editAddress"];
export const editAddress = async (formData:  EditAddressInput) => {
    try{
        // const session = await getSession();
        // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");
        const address = await (await serverClient()).viewer.address.editAddress({...formData});
        revalidatePath("/checkout")
    } catch(error) {
        throw error;
    }
}

export const getAddresses = async () => {
    try{
        // const session = await getSession();
        // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");       
        const addresses = await (await serverClient()).viewer.address.getAddresses();
        return addresses;
    } catch(error) {
        throw error
    }
}