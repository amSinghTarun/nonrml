import { baseTRPCOutputSchema } from "@nonorml/common";
import { prisma, prismaEnums } from "@nonorml/prisma";
import { z } from "zod";

export const ZCreateRoleSchema = z.object({
    roleName: z.enum([prismaEnums.UserPermissionRole.ADMIN, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.USER]),
    permissionType: z.enum([prismaEnums.UserPermissionType.API]),
    rolePermission: z.array(z.object({permissionId: z.number()}))
});
export type TCreateRoleSchema = z.infer<typeof ZCreateRoleSchema>;

export const ZGetRolesSchema = z.object({
    status: z.boolean().default(true)
});
export type TGetRolesSchema = z.infer<typeof ZGetRolesSchema>;

export const ZGetRoleSchema = z.object({
    roleId: z.number()
});
export type TGetRoleSchema = z.infer<typeof ZGetRoleSchema>;

export const ZEditRoleSchema = z.object({
    roleId: z.number(),
    roleName: z.enum([prismaEnums.UserPermissionRole.ADMIN, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.USER]).optional(),
    status: z.boolean().optional(),
    permissionType: z.enum([prismaEnums.UserPermissionType.API]).optional()
});
export type TEditRoleSchema = z.infer<typeof ZEditRoleSchema>;
    
export const ZEditRolePermissionsSchema = z.object({
    action: z.enum(["ADD", "REMOVE"]),
    rolePermission: z.array(z.number()),
    roleId: z.number(),
})
export type TEditRolePermissionsSchema = z.infer<typeof ZEditRolePermissionsSchema>;
       
export const ZDeleteRoleSchema = z.object({
    roleId: z.number()
});
export type TDeleteRoleSchema = z.infer<typeof ZDeleteRoleSchema>;

export const ZGetRoleOutputSchema = z.object({
    role: z.object({
        id: z.number(),
        roleName: z.enum([prismaEnums.UserPermissionRole.USER, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.ADMIN]),
        permissionType: z.enum([prismaEnums.UserPermissionType.API]),
        active: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date()
    }),
    rolePermissions: z.array(
        z.object({
            id: z.number(),
            permissionId: z.number(),
            permissionName: z.string(),
            roleId: z.number(),
            createdAt: z.date(),
            updatedAt: z.date()
        })
    ),
    permissionNameArray: z.array(z.string()),
});
export type TGetRoleOutputSchema = z.infer<typeof ZGetRoleOutputSchema>;

export const ZEditRoleOutputSchema = z.object({
    id: z.number(),
    roleName: z.enum([prismaEnums.UserPermissionRole.USER, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.ADMIN]),
    permissionType: z.enum([prismaEnums.UserPermissionType.API]),
    active: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date() 
});
export type TEditRoleOutputSchema = z.infer<typeof ZEditRoleOutputSchema>;

export const ZEditRolePermissionsOutputSchema = z.object({
    id: z.number(),
    roleName: z.enum([prismaEnums.UserPermissionRole.USER, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.ADMIN]),
    permissionType: z.enum([prismaEnums.UserPermissionType.API]),
    active: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date() 
});
export type TEditRolePermissionOutputSchema = z.infer<typeof ZEditRolePermissionsOutputSchema>;

export const ZDeleteRoleOutputSchema = z.object({});
export type TDeleteRoleOutputSchema = z.infer<typeof ZDeleteRoleOutputSchema>;

export const ZCreateRoleOutputSchema = z.object({
    role: z.object({
        id: z.number(),
        roleName: z.enum([prismaEnums.UserPermissionRole.ADMIN, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.USER]),
        permissionType: z.enum([prismaEnums.UserPermissionType.API]),
        active: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
    }),
    permissionNameArray: z.array(z.string())
});
export type TCreateRoleOutputSchema = z.infer<typeof ZCreateRoleOutputSchema>;

export const ZGetRolesOutputSchema = z.array(
    z.object({
        id: z.number(),
        roleName: z.enum([prismaEnums.UserPermissionRole.USER, prismaEnums.UserPermissionRole.ADMIN_APPROVER, prismaEnums.UserPermissionRole.ADMIN]),
        permissionType: z.enum([prismaEnums.UserPermissionType.API]),
        active: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date()
    })
);
export type TGetRolesOutputSchema = z.infer<typeof ZGetRolesOutputSchema>;
