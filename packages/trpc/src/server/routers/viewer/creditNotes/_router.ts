import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { addCreditNote, deleteCreditNote, editCreditNote, getCreditNote, getCreditNoteDetails, getCreditNotesAdmin } from "./creditNotes.handler";
import { ZAddCreditNoteSchema, ZGetCreditNoteSchema, ZDeleteCreditNoteSchema, ZEditCreditNoteSchema, ZGetCreditNoteDetailsSchema, ZGetCreditNotesAdminSchema } from "./creditNotes.schema";

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
        .input(ZAddCreditNoteSchema)
        .mutation( async ({ctx, input}) => await addCreditNote({ctx, input})),
    getCreditNotes: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a discount coupon"}})
        .input(ZGetCreditNotesAdminSchema)
        .query( async ({ctx, input}) => await getCreditNotesAdmin({ctx, input})),
    editCreditNote: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a discount coupon"}})
        .input(ZEditCreditNoteSchema)
        .mutation( async ({ctx, input}) => await editCreditNote({ctx, input})),
    deleteCreditNote: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create a discount coupon"}})
        .input(ZDeleteCreditNoteSchema)
        .mutation( async ({ctx, input}) => await deleteCreditNote({ctx, input}))
})