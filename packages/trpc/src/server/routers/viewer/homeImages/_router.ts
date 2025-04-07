
import { adminProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addInventoryItems, getInventory, deleteInventoryItem, editInventoryItem } from "./homeImages.handler";
import { ZAddInventoryItemsSchema, ZGetSKUDetailsSchema, ZEditInventoryItemSchema, ZDeleteInventoryItemSchema } from "./homeImages.schema";

export const HomeImagesRouter = router({
    getInventory: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .input(ZGetSKUDetailsSchema)
        .query( async ({ctx, input}) => await getInventory({ctx, input})),
    // getInventoryItem: adminProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get a particular inventory item"}})
    //     .input(ZGetInventoryItemSchema)
    //     .query( async ({ctx, input}) => {
    //     return await getInventoryItem({ctx, input});
    // }),
    // getSKUDetails: adminProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get info about a particular SKU from the inventory"}})
    //     .input(ZGetSKUDetailsSchema)
    //     .query( async ({ctx, input}) => {
    //     return await getSKUDetails({ctx, input});
    // }),
    createInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a new item in inventory"}})
        .input(ZAddInventoryItemsSchema)
        .mutation( async ({ctx, input}) => await addInventoryItems({ctx, input})),
    editInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit item from the inventory"}})
        .input(ZEditInventoryItemSchema)
        .mutation( async ({ctx, input}) => await editInventoryItem({ctx, input})),
    deleteInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a item from the inventory"}})
        .input(ZDeleteInventoryItemSchema)
        .mutation( async ({ctx, input}) => await deleteInventoryItem({ctx, input}))
})