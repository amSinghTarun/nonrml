import { z, ZodTypeAny } from "zod";

export enum TRPCResponseStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
};

export type TRPCAPIResponse<T> = {
    status: TRPCResponseStatus,
    message: string,
    data: T
};

export const baseTRPCOutputSchema = <T extends ZodTypeAny>(dataSchema: T) => {
    const baseResponse = z.object({
        status: z.enum([TRPCResponseStatus.SUCCESS, TRPCResponseStatus.FAILED]),
        message: z.string()
    });
    const apiResponse = z.object({
        data: dataSchema
    })
    return baseResponse.merge(apiResponse);
}