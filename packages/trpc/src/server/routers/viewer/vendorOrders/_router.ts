import { adminProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { deleteVendorOrder, placeVendorOrder, updateVendorOrder } from "./vendorOrder.handler";
import { ZDeleteVendorOrder, ZPlaceVendorOrder, ZUpdateVendorOrder } from "./vendorOrder.schema";

// VOrder = vendor order
export const vendorOrderRouter = router({
    addVOrder: adminProcedure
    .meta({ openAPI: {method: "POST", descrription: "Add a vendor order "}})
        .input(ZPlaceVendorOrder)
        .mutation( async ({ctx, input}) => {
        return await placeVendorOrder({ctx, input});
    }),
    updateVOrder: adminProcedure
    .meta({ openAPI: {method: "POST", descrription: "Update vendor order"}})
        .input(ZUpdateVendorOrder)
        .mutation( async ({ctx, input}) => {
        return await updateVendorOrder({ctx, input});
    }),
    deleteVOrder: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete vendor order"}})
        .input(ZDeleteVendorOrder)
        .mutation( async ({ctx, input}) => {
        return await deleteVendorOrder({ctx, input});
    })
})