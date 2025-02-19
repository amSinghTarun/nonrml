import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addBaseSkuInventory, deleteBaseSkuInventory, editBaseInventory, getBaseInventory } from "./baseSkuInventory.handler";
import { ZAddBaseSkuInventorySchema, ZDeleteBaseSkuInventorySchema, ZEditBaseSkuInventorySchema, ZGetInventoryItemSchema } from "./baseSkuInventory.schema";

export const baseSkuInventoryRouter = router({
    getBaseInventory: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .input(ZGetInventoryItemSchema)
        .query( async ({ctx, input}) => (await getBaseInventory({ctx, input}))),
    addBaseSkuInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new review to a product"}})
        .input(ZAddBaseSkuInventorySchema)
        .mutation( async ({ctx, input}) => await addBaseSkuInventory({ctx, input}) ),
    editBaseSkuDetails: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new review to a product"}})
        .input(ZEditBaseSkuInventorySchema)
        .mutation( async ({ctx, input}) => await editBaseInventory({ctx, input}) ),
    deleteBaseSkuInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a review"}})
        .input(ZDeleteBaseSkuInventorySchema)
        .mutation( async ({ctx, input}) => await deleteBaseSkuInventory({ctx, input}) )
});