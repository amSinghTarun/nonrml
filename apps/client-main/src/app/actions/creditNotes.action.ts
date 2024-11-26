"use server"

import { getSession } from "@nonrml/configs";
import { serverClient } from "../_trpc/serverClient";

export const applyCreditNote = async (creditNote: string, orderValue: number) => {
    try{
        const creditNoteDetails = await (await serverClient()).viewer.creditNotes.getCreditNote({creditNote: creditNote, orderValue:orderValue});
        return creditNoteDetails;
    } catch(error) {
        throw error;
    }
};

export const viewCreditNote = async ({creditNote, userMobile}: {creditNote: string, userMobile: string}) => {
    try{
        const session = await getSession();
        if (!session?.user.id) throw new Error("UNAUTHORISED ACTION, you must first login");
        const creditNoteDetails = await (await serverClient()).viewer.creditNotes.getCreditNoteDetails({creditNoteCode: creditNote, mobile: userMobile});
        return creditNoteDetails.data
    } catch(error) {
        throw error;
    }
};