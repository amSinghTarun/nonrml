"use server"
import { serverClient } from "@/app/_trpc/serverClient";
import { RouterInput } from "@/app/_trpc/client";
import { revalidatePath } from "next/cache";

// type AddAddressInput = RouterInput["viewer"]["address"]["addAddress"]
// export const addAddress = async (formData: AddAddressInput) => {
//     try{
//         // const session = await getSession();
//         // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");
//         const address = await (await serverClient()).viewer.address.addAddress({...formData, city:"bsp", state:"cg"});
//         revalidatePath("/checkout")
//     } catch(error) {
//         throw error;
//     }
// }

// type EditAddressInput = RouterInput["viewer"]["address"]["editAddress"];
// export const editAddress = async (formData:  EditAddressInput) => {
//     try{
//         // const session = await getSession();
//         // if( !session?.user.id ) throw new Error("UNAUTORISED ACTION, you must first login");
//         const address = await (await serverClient()).viewer.address.editAddress({...formData});
//         revalidatePath("/checkout")
//     } catch(error) {
//         throw error;
//     }
// }