import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { procedure, router } from "../../../trpc";
import { addDiscount, applyDiscount, deleteDiscount, editDiscount, getDiscounts } from "./discounts.handler";
import { ZAddDiscountSchema, ZApplyDiscountSchema, ZDeleteDiscountSchema, ZEditDiscountSchema } from "./discounts.schema";

export const discountRouter = router({
    applyDiscount: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Aply the discount coupon"}})
        .input(ZApplyDiscountSchema)
        .mutation(async ({ctx, input}) => {
        return await applyDiscount({ctx, input});
    }),
    getDiscounts: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the discounts available"}})
        .query( async ({ctx, input}) => {
        return await getDiscounts({ctx});
    }),
    createDiscount: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a discount coupon"}})
        .input(ZAddDiscountSchema)
        .mutation( async ({ctx, input}) => {
        return await addDiscount({ctx, input});
    }),
    editDiscount: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit a discount coupon"}})
        .input(ZEditDiscountSchema)
        .mutation( async ({ctx, input}) => {
        return await editDiscount({ctx, input});
    }),
    deleteDiscount: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a discount coupon"}})
        .input(ZDeleteDiscountSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteDiscount({ctx, input});
    })
})