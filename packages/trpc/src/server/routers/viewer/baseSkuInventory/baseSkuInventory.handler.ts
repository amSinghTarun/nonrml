import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddBaseSkuInventorySchema, TDeleteBaseSkuInventorySchema, TEditBaseSkuInventorySchema, TGetBaseSkuInventorySchema } from "./baseSkuInventory.schema";
import { Prisma, prisma } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";

// /*
//     Get the a particular review.
// */
// export const getReview = (async ({ctx, input}: TRPCRequestOptions<TGetBaseSkuInventorySchema>) => {
//     try{
//         const review = await prisma.reviewRating.findUniqueOrThrow({
//             where: {
//                 id: input.reviewId
//             }
//         });
//         return {status: TRPCResponseStatus.SUCCESS, message:"", data: review };
//     }  catch(error) {
//         //console.log("\n\n Error in getReview ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     }
// });


// /*
//     Get the reviews of a product.
// */
// export const getReviews = (async ({ctx, input}: TRPCRequestOptions<TGetReviewsSchema>) => {
//     try{
//         const searchCondition = input.rating ? {productId: input.productId, rating: input.rating} : {productId: input.productId };
//         const review = await prisma.reviewRating.findMany({
//             where: searchCondition, 
//             orderBy: {
//                 rating: input.sortOrder
//             }
//         } );
//         return {status: TRPCResponseStatus.SUCCESS, message:"", data:review};
//     }  catch(error) {
//         //console.log("\n\n Error in getAddress ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     }
// });


// /*
//     Let user edit their review
// */
// export const editReview = (async ({ctx, input}: TRPCRequestOptions<TEditReviewSchema>) => {
//     try{
//         let userId = ctx?.user?.id;
//         const updatedReview = await prisma.reviewRating.update({
//             where: {
//                 id: input.reviewId,
//                 userId
//             },
//             data: input
//         });
//         return {status: TRPCResponseStatus.SUCCESS, message:"", data: updatedReview};
//     }  catch(error) {
//         //console.log("\n\n Error in getAddress ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     }
// });

/*
    Add a new review for a product
    User can only give review of a product which they have bought
*/
export const addBaseSkuInventory = (async ({ctx, input}: TRPCRequestOptions<TAddBaseSkuInventorySchema>) => {
    try{
        const baseSkuInventory = await prisma.baseSkuInventory.createMany({
            data: input!
        });
        
        return {status: TRPCResponseStatus.SUCCESS, message:"", data: baseSkuInventory};
    }  catch(error) {
        //console.log("\n\n Error in addReview ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
});

// /*
//     For a user to delete their review
// */
// export const deleteReview = (async ({ctx, input}: TRPCRequestOptions<TDeleteReviewSchema>) => {
//     try{
//         const userId = ctx?.user?.id!;
//         await prisma.reviewRating.delete({
//             where: {
//                 id: input.reviewId,
//                 userId
//             }
//         })
//         return {status: TRPCResponseStatus.SUCCESS, message:"record deleted", data:{}};
//     }  catch(error) {
//         //console.log("\n\n Error in getAddress ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     }
// });