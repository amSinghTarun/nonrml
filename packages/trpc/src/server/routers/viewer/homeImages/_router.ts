
import { adminProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { uploadImage, getHomeImagesAdmin, deleteInventoryItem, editInventoryItem } from "./homeImages.handler";
import { ZUploadImageSchema, ZEditInventoryItemSchema, ZDeleteInventoryItemSchema } from "./homeImages.schema";

export const HomeImagesRouter = router({
    getHomeImagesAdmin: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .query( async ({ctx, input}) => await getHomeImagesAdmin({ctx})),
    uploadImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a new item in inventory"}})
        .input(ZUploadImageSchema)
        .mutation( async ({ctx, input}) => await uploadImage({ctx, input})),
    editInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit item from the inventory"}})
        .input(ZEditInventoryItemSchema)
        .mutation( async ({ctx, input}) => await editInventoryItem({ctx, input})),
    deleteInventory: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a item from the inventory"}})
        .input(ZDeleteInventoryItemSchema)
        .mutation( async ({ctx, input}) => await deleteInventoryItem({ctx, input}))
})