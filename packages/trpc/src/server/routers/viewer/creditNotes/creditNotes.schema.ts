import { z } from "zod";
import { prismaEnums } from "@nonrml/prisma";

export const ZAddCreditNoteSchema = z.object({
    returnOrderId: z.number().optional(),
    userId: z.number().optional(),
    value: z.number().optional(),
    replacementOrderId: z.number().optional()
});
export type TAddCreditNoteSchema = z.infer<typeof ZAddCreditNoteSchema>;

export const ZEditCreditNoteSchema = z.object({
    id: z.number(),
    value: z.number().optional(),
    expiryDate: z.date().optional(),
    redeemed: z.boolean().optional()
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