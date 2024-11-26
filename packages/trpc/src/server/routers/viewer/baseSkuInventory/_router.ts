import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { addBaseSkuInventory } from "./baseSkuInventory.handler";
import { ZAddBaseSkuInventorySchema } from "./baseSkuInventory.schema";

export const baseSkuInventoryRouter = router({
    // getReviews: publicProtectedProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get all the review of a product, can be sorted"}})
    //     .input(ZGetReviewsSchema)
    //     .query(async ({ctx, input}) => {
    //     return await getReviews({ctx, input});
    // }),
    // getReview: publicProtectedProcedure
    //     .meta({ openAPI: {method: "GET", descrription: "Get a particular review"}})
    //     .input(ZGetReviewSchema)
    //     .query( async ({ctx, input}) => {
    //     return await getReview({ctx, input});
    // }),
    addBaseSkuInventory: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new review to a product"}})
        .input(ZAddBaseSkuInventorySchema)
        .mutation( async ({ctx, input}) => {
        return await addBaseSkuInventory({ctx, input});
    }),
    // editReview: publicProtectedProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Edit existing review"}})
    //     .input(ZEditReviewsSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await editReview({ctx, input});
    // }),
    // deleteReview: publicProtectedProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Delete a review"}})
    //     .input(ZDeleteReviewsSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await deleteReview({ctx, input});
    // })
});