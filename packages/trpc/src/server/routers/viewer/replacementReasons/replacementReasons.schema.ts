import { z } from "zod";

export const ZAddReplacementReasonsSchema = z.object({
    description: z.string(),
    photoProofRequired: z.boolean(),
    videoProofRequired: z.boolean(),
    userCustomReasonRequired: z.boolean()
});
export type TAddReplacemReasonsSchema = z.infer<typeof ZAddReplacementReasonsSchema>;

export const ZEditRepalcementReasonsSchema = z.object({
    recordId: z.number(),
    description: z.string().optional(),
    videoProofRequired: z.boolean().optional(),
    userCustomReasonRequired: z.boolean().optional() 
});
export type TEditReplacementReasonsSchema = z.infer<typeof ZEditRepalcementReasonsSchema>;

export const ZDeleteRepalcementReasonsSchema = z.object({
    recordId: z.number()
});
export type TDeleteReplacementReasonsSchema = z.infer<typeof ZDeleteRepalcementReasonsSchema>; 

