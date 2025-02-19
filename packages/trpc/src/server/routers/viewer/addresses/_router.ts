import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addAddress, removeAddress, editAddress, getUserAddress, getAddresses, editAddressByAdmin } from "./address.handler";
import { ZAddAddressSchema, ZEditAddressSchema, ZGetUserAddressSchema, ZRemoveAddressSchema, ZEditAddressByAdmin } from "./address.schema";

export const addressRouter = router({
    getUserAddress: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Gives a particualr address"}})
        .input(ZGetUserAddressSchema)
        .query(async ({ctx, input}) => await getUserAddress({ctx, input}) ),
    getAddresses: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Gives all the addressses of a user"}})
        .query(async ({ctx}) => await getAddresses({ ctx })),
    addAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new address for a user"}})
        .input(ZAddAddressSchema)
        .mutation( async ({ctx, input}) => await addAddress({ctx, input}) ),
    editAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit an existing address for a user"}})
        .input(ZEditAddressSchema)
        .mutation(async ({ctx, input}) => await editAddress({ctx, input}) ),
    editAddressByAdmin: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit an existing address for a user"}})
        .input(ZEditAddressByAdmin)
        .mutation(async ({ctx, input}) => await editAddressByAdmin({ctx, input}) ),
    removeAddress: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a particular address of a user"}})
        .input(ZRemoveAddressSchema)
        .mutation(async ({ctx, input}) => await removeAddress({ctx, input}) )
})