import z from "zod";
import { adminProcedure, publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { addCreditNote, deleteCreditNote, editCreditNote, getAllCreditNote, getCreditNote, getCreditNoteDetails, getCreditNotesAdmin, sendCreditNoteOtp } from "./creditNotes.handler";
import { ZAddCreditNoteSchema, ZGetCreditNoteSchema, ZDeleteCreditNoteSchema, ZEditCreditNoteSchema, ZGetCreditNoteDetailsSchema, ZGetCreditNotesAdminSchema, ZGetAllCreditNotesSchema } from "./creditNotes.schema";

export const creditNotesRouter = router({
    getCreditNote: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Use the credit Note"}})
        .input(ZGetCreditNoteSchema)
        .query( async ({ctx, input}) => await getCreditNote({ctx, input}) ),
    sendCreditNoteOtp: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Use the credit Note"}})
        .input(z.object({}))
        .mutation( async ({ctx, input}) => await sendCreditNoteOtp({ctx, input}) ),
    getAllCreditNotes: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Use the credit Note"}})
        .input(ZGetAllCreditNotesSchema)
        .query( async ({ctx, input}) => await getAllCreditNote({ctx, input}) ),
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