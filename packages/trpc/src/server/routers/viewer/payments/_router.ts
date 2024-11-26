import { router } from "../../../trpc";
import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import * as paymentHandler from "./payments.handler";
import * as paymentSchema from "./payments.schema";

export const paymentRouter = router({
    createRzpOrder: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Create new order"}})
        .input(paymentSchema.ZCreateRzpOrderSchema)
        .mutation( async ({ctx, input}) =>  await paymentHandler.createRZPOrder({ctx, input}) ),
    updateFailedPaymentStatus: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Change payment status"}})
        .input(paymentSchema.ZChangePaymentStatusSchema)
        .mutation( async ({ctx, input}) =>  await paymentHandler.updateFailedPaymentStatus({ctx, input})),
    // editPermission: adminProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Edit permission"}})
    //     .input(permissionSchema.ZEditPermissionSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await permissionHandler.editPermissions({ctx, input});
    // }),
    // deletePermission: adminProcedure
    //     .meta({ openAPI: {method: "POST", descrription: "Delete a permission"}})
    //     .input(permissionSchema.ZDeletePermissionSchema)
    //     .mutation( async ({ctx, input}) => {
    //     return await permissionHandler.deletePermissions({ctx, input});
    // })
});