import { adminProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { procedure, router } from "../../../trpc";
import { editAddress } from "../addresses/address.handler";
import { addProduct, deleteProduct, editProduct, getProduct, getProducts } from "./product.handler";
import { ZAddProductSchema, ZDeleteProductSchema, ZEditProductSchema, ZGetProductSchema, ZGetProductsSchema } from "./product.schema";

export const productRouter = router({
    getProduct: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get a particular product"}})
        .input(ZGetProductSchema)
        .query( async ({ctx, input}) => {
        return await getProduct({ctx, input});
    }),
    getProducts : publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
        .input(ZGetProductsSchema)
        .query( async ({ctx, input}) => {
        return await getProducts({ctx, input});
    }), 
    addProduct : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product"}})
        .input(ZAddProductSchema)
        .mutation( async ({ctx, input}) => {
        return await addProduct({ctx, input});
    }),
    editProduct : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit a product"}})
        .input(ZEditProductSchema)
        .mutation( async ({ctx, input}) => {
        return await editProduct({ctx, input});
    }),
    deleteProduct : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product"}})
        .input(ZDeleteProductSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteProduct({ctx, input});
    })
});