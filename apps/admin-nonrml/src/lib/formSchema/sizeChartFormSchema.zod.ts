import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod"

export const sizeChartSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z.string().optional(),
    type: z.enum(["MEASUREMENT_TYPE",  "SIZE_VALUE", "DISPLAY_NAME"]),
    parentId: z.number().optional(), // Parent ID is optional
    sortOrder: z.number().default(0),
});