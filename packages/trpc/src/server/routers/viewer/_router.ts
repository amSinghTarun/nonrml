import z from "zod";
import { publicProcedure } from "../../procedures/publicProcedure";
import { router } from "../../trpc";
import { authRouter } from "./auth/_router";
import { productRouter } from "./products/_router";
import { vendorOrderRouter } from "./vendorOrders/_router";
import { InventoryRouter } from "./inventory/_router";
import { productVariantRouter } from "./productVariant/_router";
import { productCategoriesRouter } from "./productCategory/_router";
import { sizeChartRouter } from "./productCategorySizes/_router";
import { productImageRouter } from "./productImages/_router";
import { addressRouter } from "./addresses/_router";
import { orderRouter } from "./orders/_router";
import { paymentRouter } from "./payments/_router";
import { baseSkuInventoryRouter } from "./baseSkuInventory/_router";
import { returnRouter } from "./returns/_router";
import { replacementRouter } from "./replacements/_router";
import { creditNotesRouter } from "./creditNotes/_router";
import { userRouter } from "./user/_router";
import { HomeImagesRouter } from "./homeImages/_router";

export const viewerRouter = router({
    auth: authRouter,
    orders: orderRouter,
    address: addressRouter,
    vendorOrder: vendorOrderRouter,
    product: productRouter,
    inventory: InventoryRouter,
    productVariant: productVariantRouter,
    productCategories: productCategoriesRouter,
    sizeChart: sizeChartRouter,
    productImages: productImageRouter,
    baseSkuInventory: baseSkuInventoryRouter,
    payment: paymentRouter,
    return: returnRouter,
    replacement: replacementRouter,
    creditNotes: creditNotesRouter,
    user: userRouter,
    homeImages: HomeImagesRouter,
    testAPI: publicProcedure.input(z.object({name: z.string()})).mutation(({ctx, input}) => {
        console.log(input)
        return {input: {
            viewer: input ?? ["default output"]
        }};
    }) 
})
