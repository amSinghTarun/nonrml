import { nonrmlError } from "../types";

export const createError = (code: number, message: string) => {
    let error : nonrmlError = new Error(message);
    error.code = code;
    throw error;
};