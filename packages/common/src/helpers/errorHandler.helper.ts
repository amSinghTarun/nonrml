import { nonormlError } from "../types";

export const createError = (code: number, message: string) => {
    let error : nonormlError = new Error(message);
    error.code = code;
    throw error;
};