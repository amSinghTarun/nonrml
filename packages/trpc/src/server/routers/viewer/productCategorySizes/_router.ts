import { adminProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { procedure, router } from "../../../trpc";
import { addProductCategorySizes, deleteProductCategorySizes, editProductCategorySizes, getProductCategorySizes } from "./productCategorySizes.handler";
import { ZAddProductCategorySizeSchema, ZDeleteProductCategorySizeSchema, ZEditProductCategorySizeSchema, ZGetProductCategorySizeSchema } from "./productCategorySizes.schema";

export const productCategorySizeRouter = router({
    addProductCategoriesSize: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product category sizes"}})
        .input(ZAddProductCategorySizeSchema)
        .mutation( async ({ctx, input}) =>  await addProductCategorySizes({ctx, input})),
    getProductCategoriesSize: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product category sizes"}})
        .input(ZGetProductCategorySizeSchema)
        .query( async ({ctx, input}) => await getProductCategorySizes({ctx, input})),
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