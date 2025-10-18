import { adminProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { uploadImage, getHomeImagesAdmin, deleteImage, editImage, getHomeImages, addHomeImage, getSignedImageUploadUrl } from "./homeImages.handler";
import { ZUploadImageSchema, ZDeleteImageSchema, ZEditImageSchema, ZAddHomeImageSchema, ZGetSignedUrlSchema } from "./homeImages.schema";

export const HomeImagesRouter = router({
    getHomeImages: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .query( async ({ctx, input}) => await getHomeImages({ctx})),
    getHomeImagesAdmin: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .query( async ({ctx, input}) => await getHomeImagesAdmin({ctx})),
    uploadImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a new item in inventory"}})
        .input(ZUploadImageSchema)
        .mutation( async ({ctx, input}) => await uploadImage({ctx, input})),
    editImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit item from the inventory"}})
        .input(ZEditImageSchema)
        .mutation( async ({ctx, input}) => await editImage({ctx, input})),
    deleteImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a item from the inventory"}})
        .input(ZDeleteImageSchema)
        .mutation( async ({ctx, input}) => await deleteImage({ctx, input})),
    getSignedImageUploadUrl: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .input(ZGetSignedUrlSchema)
        .mutation( async ({ctx, input}) => await getSignedImageUploadUrl({ctx, input})),
    addHomeImage: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the whole inventory"}})
        .input(ZAddHomeImageSchema)
        .mutation( async ({ctx, input}) => await addHomeImage({ctx, input})),
})