import { adminProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addProductImage, deleteProductImage, editProductImage, editImagePriorityIndexImage, getSignedImageUploadUrl } from "./productImage.handler";
import { ZAddProductImageSchema, ZDeleteProductImageSchema, ZEditImagePriorityIndexImageSchema, ZEditProductImageSchema, ZGetSignedUrlSchema } from "./productImage.schema";

export const productImageRouter = router({
    addProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add product image"}})
        .input(ZAddProductImageSchema)
        .mutation( async ({ctx, input}) =>  await addProductImage({ctx, input}) ),
    getSignedImageUploadUrl: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add product image"}})
        .input(ZGetSignedUrlSchema)
        .mutation( async ({ctx, input}) =>  await getSignedImageUploadUrl({ctx, input}) ),
    editProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit product image details"}})
        .input(ZEditProductImageSchema)
        .mutation( async ({ctx, input}) => await editProductImage({ctx, input}) ),
    deleteProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product image"}})
        .input(ZDeleteProductImageSchema)
        .mutation( async ({ctx, input}) => await deleteProductImage({ctx, input}) ),
    editImagePriorityIndexImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product image"}})
        .input(ZEditImagePriorityIndexImageSchema)
        .mutation( async ({ctx, input}) => await editImagePriorityIndexImage({ctx, input}) )
});