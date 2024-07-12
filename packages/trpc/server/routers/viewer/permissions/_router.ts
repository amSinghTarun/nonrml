import { router } from "../../../trpc";
import { adminProcedure } from "../../../procedures/authedProcedure";
import * as permissionHandler from "./permissions.handler";
import * as permissionSchema from "./permissions.schema";

export const permissionRouter = router({
    createPermission: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create new permission"}})
        .input(permissionSchema.ZCreatePermissionSchema)
        .mutation( async ({ctx, input}) => {
        return await permissionHandler.createPermissions({ctx, input});
    }),
    getPermission: adminProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get permission based on status"}})
        .input(permissionSchema.ZGetPermissionSchema)
        .query( async ({ctx, input}) => {
        return await permissionHandler.getPermissions({ctx, input});
    }),
    editPermission: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit permission"}})
        .input(permissionSchema.ZEditPermissionSchema)
        .mutation( async ({ctx, input}) => {
        return await permissionHandler.editPermissions({ctx, input});
    }),
    deletePermission: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete a permission"}})
        .input(permissionSchema.ZDeletePermissionSchema)
        .mutation( async ({ctx, input}) => {
        return await permissionHandler.deletePermissions({ctx, input});
    })
});