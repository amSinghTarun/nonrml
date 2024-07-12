
import { adminProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { addInventoryItem, deleteInventoryItem, editInventoryItem, getInventory, getInventoryItem, getSKUDetails } from "./inventory.handler";
import { ZAddInventoryItemSchema, ZDeleteInventoryItemSchema, ZEditInventoryItemSchema, ZGetInventoryItemSchema, ZGetSKUDetailsSchema } from "./inventory.schema";

export const InventoryRouter = router({
    getInventory: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .query( async ({ctx}) => {
        return await getInventory({ctx});
    }),
    getInventoryItem: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular inventory item"}})
        .input(ZGetInventoryItemSchema)
        .query( async ({ctx, input}) => {
        return await getInventoryItem({ctx, input});
    }),
    getSKUDetails: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get info about a particular SKU from the inventory"}})
        .input(ZGetSKUDetailsSchema)
        .query( async ({ctx, input}) => {
        return await getSKUDetails({ctx, input});
    }),
    createInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a new item in inventory"}})
        .input(ZAddInventoryItemSchema)
        .mutation( async ({ctx, input}) => {
        return await addInventoryItem({ctx, input});
    }),
    editInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit item from the inventory"}})
        .input(ZEditInventoryItemSchema)
        .mutation( async ({ctx, input}) => {
        return await editInventoryItem({ctx, input});
    }),
    deleteInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a item from the inventory"}})
        .input(ZDeleteInventoryItemSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteInventoryItem({ctx, input});
    })
})