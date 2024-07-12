import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCreateRoleOutputSchema, TCreateRoleSchema, TDeleteRoleOutputSchema, TDeleteRoleSchema, TEditRoleOutputSchema, TEditRolePermissionOutputSchema, TEditRolePermissionsSchema, TEditRoleSchema, TGetRoleOutputSchema, TGetRoleSchema, TGetRolesOutputSchema, TGetRolesSchema, ZCreateRoleOutputSchema } from "./role.schema";
import { createRole, getRole, deleteRole, editRole, editRolePermission, getRoles } from "@nonorml/rbac";
import { Prisma } from "@nonorml/prisma";

/*
    Create user role
*/
export const createUserRole = async ({ctx, input}: TRPCRequestOptions<TCreateRoleSchema>)  => {
    try{
        const newRole = await createRole({...input, active: true});
        return { status: TRPCResponseStatus.SUCCESS, message:"Role creted", data: { ...newRole } };
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Get all the roles
*/
export const getUserRoles = async ({ctx, input}: TRPCRequestOptions<TGetRolesSchema>)  => {
    try{
        const roles = await getRoles(input.status);
        return { status: TRPCResponseStatus.SUCCESS, message: "Roles fetched", data: roles};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Get a particular role
*/
export const getUserRole = async ({ctx, input}: TRPCRequestOptions<TGetRoleSchema>)  => {
    try{ 
        const role = await getRole(input.roleId);
        return { status: TRPCResponseStatus.SUCCESS, message: "Role fetched", data: role!};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Delete a role
*/
export const deleteUserRole = async ({ctx, input}: TRPCRequestOptions<TDeleteRoleSchema>)  => {
    try{
        await deleteRole(input.roleId);
        return { status: TRPCResponseStatus.SUCCESS, message:"Role deleted", data: {}};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Edit role 
*/
export const editUserRole = async ({ctx, input}: TRPCRequestOptions<TEditRoleSchema>)  => {
    try{
        const edittedRole = await editRole(input.roleId, {permissionType: input.permissionType, roleName: input.roleName, status: input.status});
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: edittedRole};
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
    Edit the permissions of a role
*/
export const editUserPermission = async ({ctx, input}: TRPCRequestOptions<TEditRolePermissionsSchema>)  => {

    try{
        const rolePermissionAdded = await editRolePermission(input.action, input.roleId, input.rolePermission)
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: rolePermissionAdded}; 
    } catch(error) {
        console.log("\n\n Error in getAddress ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};