import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { addProduct, getProduct, getAdminProduct, getProducts, getProductsSizes, verifyCheckoutProducts, getProductVariantQuantity, getHomeProducts, editProduct, getAdminProducts, getRelatedProducts } from "./product.handler";
import { ZAddProductSchema, ZGetProductSchema, ZGetProductVariantQuantitySchema, ZGetProductsSchema, ZGetProductsSizes, ZVerifyCheckoutProductsSchema, ZGetHomeProductsSchema, ZEditProductSchema, ZGetRelatedProductsSchema } from "./product.schema";

export const productRouter = router({
    getProduct: publicProcedure
        .meta({ openAPI: {method: "GET", description: "Get a particular product"}})
        .input(ZGetProductSchema)
        .query(async ({ctx, input}) => await getProduct({ctx, input})),
    getAdminProduct: adminProcedure
        .meta({ openAPI: {method: "GET", description: "Get a particular product"}})
        .input(ZGetProductSchema)
        .query(async ({ctx, input}) => await getAdminProduct({ctx, input})),
    getProducts : publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
        .input(ZGetProductsSchema)
        .query( async ({ctx, input}) => await getProducts({ctx, input})), 
    getRelatedProducts : publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
        .input(ZGetRelatedProductsSchema)
        .query( async ({ctx, input}) => await getRelatedProducts({ctx, input})), 
    getAdminProducts : adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
        .input(ZGetProductsSchema)
        .query( async ({ctx, input}) => await getAdminProducts({ctx, input})), 
    getHomeProducts : publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the products"}})
        .input(ZGetHomeProductsSchema)
        .query( async ({ctx, input}) => await getHomeProducts({ctx, input})), 
    addProduct : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product"}})
        .input(ZAddProductSchema)
        .mutation( async ({ctx, input}) => await addProduct({ctx, input})),
    getProductSizes : publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product"}})
        .input(ZGetProductsSizes)
        .query( async ({ctx, input}) => await getProductsSizes({ctx, input}) ),
    verifyCheckoutProducts: publicProtectedProcedure
        .input(ZVerifyCheckoutProductsSchema)
        .query( async ({ctx, input}) => await verifyCheckoutProducts({ctx, input})),
    getProductVariantQuantity: publicProcedure
        .input(ZGetProductVariantQuantitySchema)
        .mutation( async ({ctx, input}) => await getProductVariantQuantity({ctx, input})),
    editProduct : adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit a product"}})
        .input(ZEditProductSchema)
        .mutation( async ({ctx, input}) => await editProduct({ctx, input}) )
});