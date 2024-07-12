import { prisma, prismaEnums, prismaTypes } from "@nonorml/prisma";
import { cache } from "@nonorml/cache";
import { createError } from "@nonorml/common";

type permission = Omit<prismaTypes.RolePermissions, "id"|"createdAt"|"updatedAt">
interface createRoleOptions extends Omit<prismaTypes.Roles, "id"|"createdAt"|"updatedAt"> {
   rolePermission: {
        permissionId : number;
    }[]
}
export type PermissionRoleMapType = Map<string, string[]>;

const getPermissionIdsFromRequestObj = ( permissions: {permissionId: number, }[] ) => {
    let permissionArray : number[] = [];
    for(let permission of permissions) {
        permissionArray.push(permission.permissionId);
    }
    return permissionArray;
}

const createRolePermissionArray = (permissions: prismaTypes.Permissions[], roleId: number) => {
    const rolePermissionJoinArray = [];
    const permissionNameArray = [];
    for(let permission of permissions) {
        rolePermissionJoinArray.push({
            roleId,
            permissionId: permission.id,
            permissionName: permission.permissionName
        })
        permissionNameArray.push(permission.permissionName)
    };
    return {rolePermissionJoinArray, permissionNameArray};
}

const createPermissionNameArray = ( rolePermissions: prismaTypes.RolePermissions[]) => {
    const permissionNameArray = [];
    for(let permission of rolePermissions) {
        permissionNameArray.push(permission.permissionName)
    };
    return { permissionNameArray };
};

export const createRole = async (roleDetails:createRoleOptions) => {
    const role = await prisma.roles.create({
        data: roleDetails
    });
    // create an array of permission ids
    const permissionIdArray = getPermissionIdsFromRequestObj(roleDetails.rolePermission);

    // fetch the array of multiple permissions to check and create array to store in the join table.
    const permissionsForRole = await prisma.permissions.findMany({
        where : {
            id: {
                in : [...permissionIdArray]
            } 
        }
    });

    // create a array to store in the join 
    const { rolePermissionJoinArray, permissionNameArray } = createRolePermissionArray(permissionsForRole, role.id);
    await prisma.rolePermissions.createMany({
        data : rolePermissionJoinArray
    })
    
    await cache.setStringByName(JSON.stringify(role.id), JSON.stringify(permissionNameArray));
    return {role, permissionNameArray};
}

export const getRole = async (roleIdentifier: keyof typeof prismaEnums.UserPermissionRole | number, getArrayOnly?: boolean) => {
    if(getArrayOnly){
        let rolePermissionCache = await cache.getStringByName(JSON.stringify(`${roleIdentifier}`));
        if(rolePermissionCache)
            return JSON.parse(rolePermissionCache);
    }
    let role: prismaTypes.Roles | null;
    let rolePermissions : prismaTypes.RolePermissions[] | null;
    if(roleIdentifier == prismaEnums.UserPermissionRole.USER || roleIdentifier == prismaEnums.UserPermissionRole.ADMIN || roleIdentifier == prismaEnums.UserPermissionRole.ADMIN_APPROVER) {
        role = await prisma.roles.findUnique({
            where: {
                roleName: roleIdentifier
            }
        });
    } else if(typeof roleIdentifier == 'number') {
        role = await prisma.roles.findUnique({
            where: {
                id: roleIdentifier
            }
        })
    } else {
        throw createError(400, "Provide a valid role identifier");
    }
    if(role){
        // get the permissions associated with the role
        rolePermissions = await prisma.rolePermissions.findMany({
            where: {
                roleId: role.id
            }
        });
        // create a array of permissions name to store in the cache
        const { permissionNameArray } = createPermissionNameArray(rolePermissions);
        // for now no expiry
        await cache.setStringByName(JSON.stringify(role.id), JSON.stringify(permissionNameArray));
        return {role, rolePermissions, permissionNameArray};
    }
    throw createError(404, "No role found for the given id");
};

// Just return the roles with all the data and no permission map/array or anything
// coz anyways the admin is gonna call getRole function to get the permissions
// associated with a role
export const getRoles = async (activeStatus: boolean) => {
    
    //const rolePermissionMapString = await cache.getStringByName("rolePermissionsMap");
    //if(rolePermissionMapString)
        //return JSON.parse(rolePermissionMapString);
    
    const roles = await prisma.roles.findMany({
        where: {
            active: activeStatus
        }
    });

    /*
    const roleIdArray = [];
    const roleIdToName : {[roleId: number]: string} = {};
    for( let role of roles ) {
        roleIdArray.push(role.id);
        roleIdToName[role.id] = role.roleName;
    } 

    const roleWithPermissions = await prisma.rolePermissions.findMany({
        where: {
            roleId: {
                in : roleIdArray
            },
        },
        select : {
            permissionName : true,
            roleId: true
        }
    });

    let rolePermissionMap : Map<string, string[]> | null= new Map();

    for( let permissionName of roleWithPermissions ) {
        const roleId = roleIdToName[permissionName.roleId] ? roleIdToName[permissionName.roleId] : null;
        if(!roleId)
            throw createError(500, `Permission for role with id ${permissionName.roleId} are missing`);

        if(!rolePermissionMap.get(roleId!)){
            rolePermissionMap.set(roleId!, [permissionName.permissionName]);
            continue;
        }
        const existingPermissions = rolePermissionMap.get(roleId!);
        rolePermissionMap.set(roleId!, [...existingPermissions!, permissionName.permissionName]);
    };

    // maybe not required, instead let's cache the map as it is, it will ease out searching and storing
    // for(let key of rolePermissionMap.keys()) {
        // await cache.setStringByName(key, JSON.stringify(rolePermissionMap.get(key)));
    // }

    // caching the map
    // await cache.setStringByName("rolePermissionsMap", JSON.stringify(rolePermissionMap));
    */

    return roles;

};

export const checkPermission = async (roleId: number, requestedObject: string) : Promise<boolean> => {
    let rolePermissonString = await cache.getStringByName(`${roleId}`);
    let rolePermissionNameArray : string[] | null = null; 
    if(!rolePermissonString){
        ({ permissionNameArray: rolePermissionNameArray } = await getRole(roleId));
    } else {
        rolePermissionNameArray = JSON.parse(rolePermissonString);
    }
    if(!rolePermissionNameArray){
        throw createError(400, "Provide a valid role identifier");
    }
    const hasPermission = rolePermissionNameArray.includes(requestedObject);
    // If the permission fails then 403 must be returned
    if(!hasPermission)
        throw createError(403, "You don't have the required permission");
    return hasPermission;
};
    
type editRoleOptionsType = {
    roleName?: keyof typeof prismaEnums.UserPermissionRole 
    permissionType?: keyof typeof prismaEnums.UserPermissionType
    status?: boolean
}

// can change role name as what is used is role id
// cannot change permission as we have seperate function for it
// can change permission type
export const editRole = async (roleId: number , editRoleOptions: editRoleOptionsType) : Promise<prismaTypes.Roles> => {
    const updatedRole = await prisma.roles.update({
        where : {
            id: roleId
        },
        data : editRoleOptions
    });
    await cache.deleteByName(`${updatedRole.id}`);
    return updatedRole;
};

// let's return only the role for now, we will try to keep the flow as whenever edit is done, the 
// user will be redirected to the role page
export const editRolePermission = async (editType: "ADD" | "REMOVE", roleId: number, rolePermission: number[]) => {
    const addPermissions = [];
    let role = await prisma.roles.findFirst({
        where: {
            id: roleId
        }
    });
    if(!role)
        throw createError(404, "Provide a valid role identifier");
    
    await cache.deleteByName(`${role.id}`);

    const permissionIdToAdd = await prisma.permissions.findMany({
        where: {
            id : {
                in: rolePermission
            }
        },
        select : {
            id: true,
            permissionName: true
        }
    });

    if(rolePermission.length != permissionIdToAdd.length)
        throw createError(403, "One of the permission id is not accurate");

    for(let permission of permissionIdToAdd) {
        addPermissions.push({
            permissionName: permission.permissionName,
            permissionId: permission.id,
            roleId: roleId
        })
    }

    if (editType == "ADD") {
        await prisma.rolePermissions.createMany({
            data: addPermissions
        })
        return role;
    } else if (editType == "REMOVE") {
        await prisma.rolePermissions.deleteMany({
            where: {
                id: {
                    in: rolePermission
                }
            }
        });
        return role;
    } else {
        throw createError(400, "Provide a valid action type");
    }
};

// You can't delete a Role that is being used by any of the user
// If the role is not being used, then delete all of it's occurances from the rolePermission table and then decrease the
// use count of each permission.
export const deleteRole = async (roleId: number) : Promise<prismaTypes.Roles> => {
    // when you delete a role then you have to decrease the use count of the permissions associated with the role
    const roleUseCount = await prisma.user.findMany({
        where : {
            role: roleId
        }
    })
    if(roleUseCount.length != 0){
        throw createError(403, "Cannot delete a role that is being used");
    }
    const roleDeleted = await prisma.roles.delete({
        where: {
            id: roleId
        }
    });

    await prisma.rolePermissions.deleteMany({
        where: {
            roleId: roleDeleted.id
        }
    });
    return roleDeleted;
};