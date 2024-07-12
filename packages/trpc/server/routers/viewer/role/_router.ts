import { router } from "../../../trpc";
import { adminProcedure } from "../../../procedures/authedProcedure";
import * as roleHandler from "./role.handler";
import * as roleSchemaTypes from "./role.schema";

export const roleRouter = router({
    createRole: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "This api is used to create new role"}})
        .input(roleSchemaTypes.ZCreateRoleSchema)
        .mutation( async ({ctx, input}) => {
            return await roleHandler.createUserRole({ctx, input})
        }),
    getRole: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "This api is used to get a particular role"}})
        .input(roleSchemaTypes.ZGetRoleSchema)
        .query( async ({ctx, input}) => {
            return await roleHandler.getUserRole({ctx, input});
        }),
    getRoles: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "This api is used to fetch all the roles"}})
        .input(roleSchemaTypes.ZGetRolesSchema)
        .query( async ({ctx, input}) => {
            return await roleHandler.getUserRoles({ctx, input});
        }),
    deleteRole: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "This api is used to delete a particular role"}})
        .input(roleSchemaTypes.ZDeleteRoleSchema)
        .mutation( async ({ctx, input}) => {
            return await roleHandler.deleteUserRole({ctx, input});
        }),
    editRoles: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "This api is used to edit static properties of a role"}})
        .input(roleSchemaTypes.ZEditRoleSchema)
        .mutation( async ({ctx, input}) => {
            return await roleHandler.editUserRole({ctx, input});
        }),
    editRolePermissions: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "This api is used to edit permissions of a role"}})
        .input(roleSchemaTypes.ZEditRolePermissionsSchema)
        .mutation( async ({ctx, input}) => {
            return await roleHandler.editUserPermission({ctx, input});
        })
});