import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { addDiscount, getCreditNote, getCreditNoteDetails } from "./creditNotes.handler";
import { ZAddDiscountSchema, ZGetCreditNoteSchema, ZGetCreditNoteDetailsSchema } from "./creditNotes";

export const creditNotesRouter = router({
    getCreditNote: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Use the credit Note"}})
        .input(ZGetCreditNoteSchema)
        .mutation( async ({ctx, input}) => await getCreditNote({ctx, input}) ),
    getCreditNoteDetails: publicProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get all the discounts available"}})
        .input(ZGetCreditNoteDetailsSchema)
        .query( async ({ctx, input}) => await getCreditNoteDetails({ctx, input}) ),
    createCreditNote: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a discount coupon"}})
        .input(ZAddDiscountSchema)
        .mutation( async ({ctx, input}) => await addDiscount({ctx, input})),
})