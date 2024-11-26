import { adminProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addProductImage, deleteProductImage, editProductImage } from "./productImage.handler";
import { ZAddProductImageSchema, ZDeleteProductImageSchema, ZEditProductImageSchema } from "./productImage.schema";

export const productImageRouter = router({
    addProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add product image"}})
        .input(ZAddProductImageSchema)
        .mutation( async ({ctx, input}) => {
        return await addProductImage({ctx, input});
    }),
    editProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit product image details"}})
        .input(ZEditProductImageSchema)
        .mutation( async ({ctx, input}) => {
        return await editProductImage({ctx, input});
    }),
    deleteProductImage: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product image"}})
        .input(ZDeleteProductImageSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteProductImage({ctx, input});
    }),
});