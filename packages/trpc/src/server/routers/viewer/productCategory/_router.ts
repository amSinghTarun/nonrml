import { adminProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { addProductCategories, getProductCategories, editProductCategories, deleteProductCategories } from "./productCategory.handler";
import { ZAddProductCategorySchema, ZGetProductCategorySchema, ZEditProductCategorySchema, ZDeleteProductCategorySchema } from "./productCategory.schema";

export const productCategoriesRouter = router({
    getProductCategories: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get product categories"}})
        .input(ZGetProductCategorySchema)
        .query(async ({ctx, input}) =>  await getProductCategories({ctx, input}) ),
    addProductCategories: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product categories"}})
        .input(ZAddProductCategorySchema)
        .mutation( async ({ctx, input}) => await addProductCategories({ctx, input}) ),
    editProductCategories: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit a product category"}})
        .input(ZEditProductCategorySchema)
        .mutation( async ({ctx, input}) => await editProductCategories({ctx, input}) ),
    deleteProductCategories: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a product category"}})
        .input(ZDeleteProductCategorySchema)
        .mutation( async ({ctx, input}) => await deleteProductCategories({ctx, input}) ),
});