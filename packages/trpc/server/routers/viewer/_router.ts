import { mergeRouters, Router } from "@trpc/server";
import { router } from "../../trpc";
import { authRouter } from "./auth/_router";
import { vendorOrderRouter } from "./vendorOrders/_router";

export const viewerRouter = router({
    auth: authRouter,
    vendorOrder: vendorOrderRouter
})
