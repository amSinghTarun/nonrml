import { adminProcedure } from "../../../procedures/authedProcedure";
import { publicProcedure } from "../../../procedures/publicProcedure";
import { procedure, router } from "../../../trpc";
import { addSizeChart, deleteSizeChart, editSizeChart, getSizeChart } from "./productCategorySizes.handler";
import { ZGetSizeChartSchema, ZDeleteSizeChartSchema, ZEditSizeChartSchema, ZAddSizeChartSchema } from "./productCategorySizes.schema";

export const sizeChartRouter = router({
    addSizeChart: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product category sizes"}})
        .input(ZAddSizeChartSchema)
        .mutation( async ({ctx, input}) =>  await addSizeChart({ctx, input})),
    getSizeChart: publicProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add new product category sizes"}})
        .input(ZGetSizeChartSchema)
        .query( async ({ctx, input}) => await getSizeChart({ctx, input})),
    editSizeChart: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit product category size"}})
        .input(ZEditSizeChartSchema)
        .mutation( async ({ctx, input}) => await editSizeChart({ctx, input}) ),
    deleteSizeChart: adminProcedure
        .meta({ openAPI: {method: "POST", descrription: "Delete size"}})
        .input(ZDeleteSizeChartSchema)
        .mutation( async ({ctx, input}) => await deleteSizeChart({ctx, input})),
});