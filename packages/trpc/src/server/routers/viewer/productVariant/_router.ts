import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { addProductVariants, deleteProductVariant } from "./productVariant.handler";
import { ZAddProductVariantsSchema, ZDeleteProductVariantSchema } from "./productVariant.schema";

export const productVariantRouter = router({
    addProductVariants : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product"}})
        .input(ZAddProductVariantsSchema)
        .mutation( async ({ctx, input}) => await addProductVariants({ctx, input}) ),
    // getProduct: publicProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get a particular product"}})
    //     .input(ZGetProductSchema)
    //     .query( async ({ctx, input}) => {
    //     return await getProduct({ctx, input});
    // }),
    // getProducts : publicProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
    //     .input(ZGetProductsSchema)
    //     .query( async ({ctx, input}) => {
    //     return await getProducts({ctx, input});
    // }), 
    // editProduct : adminProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Edit a product"}})
    //     .input(ZEditProductSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await editProduct({ctx, input});
    // }),
    deleteProductVariant : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product"}})
        .input(ZDeleteProductVariantSchema)
        .mutation( async ({ctx, input}) => await deleteProductVariant({ctx, input}) )
});