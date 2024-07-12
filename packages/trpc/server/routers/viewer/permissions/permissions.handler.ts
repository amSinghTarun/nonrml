import { createError, TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { Prisma, prisma } from "@nonorml/prisma";
import * as permissionSchemas from "./permissions.schema";
import { roleRouter } from "../role/_router";

/*
Role:
    id: 1
    roleName: ADMIN
    active: true

Permissions:
    id: 1
    permissionName: /updatePermissions
    active: true

RolePermissions:
    - id: 1
      permissionId: 1
      permissionName: /updatePermissions
      roleId: 1
    - id: 2
      permissionId: 2
      permissionName: /createOrder
      roleId: 1
*/

/*
create permission for a role
Admin side of handler
*/
export const createPermissions = async ({ctx, input}: TRPCRequestOptions<permissionSchemas.TCreatePermissionSchema>)   => {
    try{
        const newPermissions = await prisma.permissions.create({
            data: input
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"Role creted", data: newPermissions};
    } catch(error) {
        console.log("\n\n Error in createPermissions ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/*
Get the permission with custom status filter, by default the active status is set to true, it means
if not specified any status, it will give the active permissions
*/
export const getPermissions = async ({ctx, input}: TRPCRequestOptions<permissionSchemas.TGetPermissionSchema>)   => {
    try{
        const permissions = await prisma.permissions.findMany({
            where: {
                active: input.active
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message: "Roles fetched", data: permissions};
    } catch(error) {
        console.log("\n\n Error in getPermissions ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/* 
edit the active status and name of the permission of a permission,
*/
export const editPermissions = async ({ctx, input}: TRPCRequestOptions<permissionSchemas.TEditPermissionSchema>)   => {
    try{
        const updateData : {active: boolean, permissionName: string} | {active: boolean} = input;
        const edittedPermission = await prisma.permissions.update({
            where:{
                id: input.permissionId
            },
            data: updateData
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: edittedPermission};
    } catch(error) {
        console.log("\n\n Error in editPermissions ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/*
Delete a permission
*/
export const deletePermissions = async ({ctx, input}: TRPCRequestOptions<permissionSchemas.TDeletePermissionSchema>)   => {
    try{
        await prisma.permissions.delete({
            where: {
                id: input.permissionId
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"Role deleted", data: {}};
    } catch(error) {
        console.log("\n\n Error in deletePermissions ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};