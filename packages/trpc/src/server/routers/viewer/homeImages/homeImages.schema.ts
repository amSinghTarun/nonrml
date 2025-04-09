import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZUploadImageSchema = z.object({
    image: z.string(),
    legacyType: z.enum(Object.keys(prismaEnums.HomeImageType) as [keyof typeof prismaEnums.HomeImageType])
});
export type TUploadImageSchema = z.infer<typeof ZUploadImageSchema>;

export const ZEditImageSchema = z.object({
    id: z.number(),
    active: z.boolean().optional(),
    currentType: z.enum(Object.keys(prismaEnums.HomeImageType) as [keyof typeof prismaEnums.HomeImageType]).optional()
});
export type TEditImageSchema = z.infer<typeof ZEditImageSchema>;

export const ZDeleteImageSchema = z.object({
    id: z.number(),
});
export type TDeleteImageSchema = z.infer<typeof ZDeleteImageSchema>;

export const ZGetInventoryItemSchema = z.object({
    sku: z.string().optional()
});
export type TGetInventoryItemSchema = z.infer<typeof ZGetInventoryItemSchema>;

export const ZGetSKUDetailsSchema = z.object({
    sku: z.string().optional()
})
export type TGetSKUDetailsSchema = z.infer<typeof ZGetSKUDetailsSchema>;

export const ZGetInventoryItemsSchema = z.object({ });
export type TGetInventoryItemsSchema = z.infer<typeof ZGetInventoryItemsSchema>;