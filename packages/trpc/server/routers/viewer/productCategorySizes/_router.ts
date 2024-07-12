import { adminProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { addProductCategorySizes, deleteProductCategorySizes, editProductCategorySizes } from "./productCategorySizes.handler";
import { ZAddProductCategorySizeSchema, ZDeleteProductCategorySizeSchema, ZEditProductCategorySizeSchema } from "./productCategorySizes.schema";

export const productCategoriesRouter = router({
    addProductCategoriesSize: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product category sizes"}})
        .input(ZAddProductCategorySizeSchema)
        .mutation( async ({ctx, input}) => {
        return await addProductCategorySizes({ctx, input});
    }),
    editProductCategoriesSize: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit product category size"}})
        .input(ZEditProductCategorySizeSchema)
        .mutation( async ({ctx, input}) => {
        return await editProductCategorySizes({ctx, input});
    }),
    deleteProductCategoriesSize: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete product category size"}})
        .input(ZDeleteProductCategorySizeSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteProductCategorySizes({ctx, input});
    }),
});