import { z } from "zod";
import { prismaEnums } from "@nonrml/prisma";

export const ZAddCreditNoteSchema = z.object({
    returnOrderId: z.number().optional(),
    userId: z.number().optional(),
    email: z.string().optional(),
    value: z.number().optional(),
    replacementOrderId: z.number().optional()
}).refine( values => values.userId && (!values.email || !values.value), { message: "Value and Email both are needed"} );
export type TAddCreditNoteSchema = z.infer<typeof ZAddCreditNoteSchema>;

export const ZEditCreditNoteSchema = z.object({
    id: z.number(),
    value: z.number().optional(),
    expiryDate: z.date().optional(),
    remainingValue: z.number().optional(),
});
export type TEditCreditNoteSchema = z.infer<typeof ZEditCreditNoteSchema>; 

export const ZDeleteCreditNoteSchema = z.object({
    id: z.number()
});
export type TDeleteCreditNoteItem = z.infer<typeof ZDeleteCreditNoteSchema>;

export const ZGetCreditNoteSchema = z.object({
    creditNote: z.string(),
    orderValue: z.number()
});
export type TGetCreditNoteSchema = z.infer<typeof ZGetCreditNoteSchema>;

export const ZGetAllCreditNotesSchema = z.object({
    otp: z.string().length(6, "Invalid OTP length")
});
export type TGetAllCreditNotesSchema = z.infer<typeof ZGetAllCreditNotesSchema>;

export const ZGetCreditNotesAdminSchema = z.object({
    userId: z.number().optional(),
    orderId: z.string().optional(),
    creditNoteCode: z.string().optional()
});
export type TGetCreditNotesAdminSchema = z.infer<typeof ZGetCreditNotesAdminSchema>;

export const ZGetCreditNoteDetailsSchema = z.object({
    creditNoteCode: z.string(),
    mobile: z.string().regex(/^[6-9]\d{9}$/g, "Invalid mobile number")
});
export type TGetCreditNoteDetailsSchema = z.infer<typeof ZGetCreditNoteDetailsSchema>;