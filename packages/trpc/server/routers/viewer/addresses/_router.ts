import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addAddress, removeAddress, editAddress, getAddress, getAddresses } from "./address.handler";
import { ZAddAddressSchema, ZEditAddressSchema, ZGetAddressesSchema, ZGetAddressSchema, ZRemoveAddressSchema } from "./address.schema";

export const addressRouter = router({
    getAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Gives a particualr address"}})
        .input(ZGetAddressSchema)
        .query(async ({ctx, input}) => {
        return await getAddress({ctx, input});
    }),
    getAddresses: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Gives all the addressses of a user"}})
        .input(ZGetAddressesSchema)
        .query(async ({ctx, input}) => {
        return await getAddresses({ctx, input});
    }),
    addAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new address for a user"}})
        .input(ZAddAddressSchema)
        .mutation( async ({ctx, input}) => {
        return await addAddress({ctx, input});
    }),
    editAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit an existing address for a user"}})
        .input(ZEditAddressSchema)
        .mutation(async ({ctx, input}) => {
        return await editAddress({ctx, input});
    }),
    removeAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a particular address of a user"}})
        .input(ZRemoveAddressSchema)
        .mutation(async ({ctx, input}) => {
        return await removeAddress({ctx, input});
    })
})