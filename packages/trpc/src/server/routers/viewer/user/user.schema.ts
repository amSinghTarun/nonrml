import { prismaEnums } from "@nonrml/prisma";
import { z } from "zod";

export const ZGetUsersSchema = z.object({
    mobile: z.number().optional()
});
export type TGetUsersSchema = z.infer<typeof ZGetUsersSchema>;

export const ZChangeRoleSchema = z.object({
    userId: z.number(),
    role: z.enum(Object.keys(prismaEnums.UserPermissionRoles) as [keyof typeof prismaEnums.UserPermissionRoles])
});
export type TChangeRoleSchema = z.infer<typeof ZChangeRoleSchema>;
