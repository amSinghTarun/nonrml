import { TRPCResponseStatus } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TAddProductVariantsSchema, TDeleteProductVariantSchema, TEditProductSchema, TGetProductSchema } from "./productVariant.schema";
import { Prisma } from "@nonrml/prisma";
import { never } from "zod";

/*
    get products
    includes:
        Inventory
        product Images
        category for size chart 
        rating and reviews
// */
// export const getProductSizes = async ({ctx, input}: TRPCRequestOptions<TGetProductSchema>) => {
//     try{
//         const product = await prisma.products.findUniqueOrThrow({
//             where : {
//                 id: input.productId,
//             },
//             include: {
//                 ProductImages: true,
//                 reviewRating: true,
//                 productInventoryMap:{
//                     include: {
//                         inventory: {
//                             select:{
//                                 size: true,
//                                 color: true,
//                                 quantity: true,
//                                 sku: true,
//                                 categoryId: true
//                             }
//                         }
//                     }
//                 }
//             }
//         });
//         let productCategory = {};
//         if(true) // replace with cache check
//             productCategory = await prisma.productCategories.findUniqueOrThrow({
//                 where: {
//                     id: product.productInventoryMap?.inventory.categoryId
//                 },
//                 include: {
//                     ProductCategoryLink: true
//                 }
//         })
//         return { status: TRPCResponseStatus.SUCCESS, message:"", data: product};
//     } catch(error) {
//         //console.log("\n\n Error in getProduct ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code: "BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     } 
// };

// /* 
// Get all the products
// Cursor besed pagination
// Can apply filters
// */
// export const getProducts = async ({ctx, input} : TRPCRequestOptions<TGetProductsSchema>) => {
//     try{        
//         let paginationQuery : {take: number, skip: 1, cursor: {id: number}} | {take: number} = { take: input.back ? -1 * take : take };
//         if(input.lastId){
//             paginationQuery = {
//                 ...paginationQuery,
//                 skip: 1,
//                 cursor: {
//                     id: input.lastId
//                 }
//             }
//         }
        
//         let searchRequest = {};
//         if(input.priceBetween){
//             input.priceBetween.sort((a,b) => a-b);
//             searchRequest = { finalPrice: {lte: input.priceBetween[0], gte:input.priceBetween[1]} }
//         }
//         searchRequest = input.categoryId ? {...searchRequest, category: input.categoryId} : searchRequest;
//         searchRequest = input.tags ? {...searchRequest, tags: { hasSome: input.tags }} : searchRequest;
//         searchRequest = input.rating ? {...searchRequest, rating: {gte: input.rating}} : searchRequest;
            
//         if(input.size && input.color){
//             searchRequest = {...searchRequest, productSkus: { every: { size: input.size, color: input.color}}}
//         } else {
//             searchRequest = input.size ? {...searchRequest, productSkus: { every: { size: input.size } } } : searchRequest;
//             searchRequest = input.color ? {...searchRequest, productSkus: { every: { color: input.color } } } : searchRequest;
//         }

//         let queryJSON : typeof paginationQuery  & {include: {ProductImages: boolean}} & {where?: any} = {
//             ...paginationQuery,
//             include: {
//                 ProductImages: true,
//             }
//         }
//         if(Object.keys(searchRequest).length != 0 )
//             queryJSON = {...queryJSON, where: { ...searchRequest }}
//         let product = await prisma.products.findMany(queryJSON);

//         return {status:TRPCResponseStatus.SUCCESS, message:"", data: product}
//     } catch(error) {
//         //console.log("\n\n Error in deleteProductImage ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     } 
// };

export const addProductVariants = async ({ctx, input} : TRPCRequestOptions<TAddProductVariantsSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const prisma = ctx?.prisma!
    
        const product = await prisma.products.findUnique({where: {id: input.productId}, select: {sku: true}})

        const variant = await prisma.productVariants.create({
            data: {...input, subSku: `${product?.sku}_${input.size.toUpperCase()}`}
        });

        return {status:TRPCResponseStatus.SUCCESS, message:"Product variants added", data: variant};
    } catch(error) {
        //console.log("\n\n Error in adding product variants ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 
};

// export const editProduct =  async ({ctx, input} : TRPCRequestOptions<TEditProductSchema>) => {
//     try{
//         if(input.categoryId){
//             const category = await prisma.productCategories.findUnique({
//                 where: {
//                     id: input.categoryId
//                 }
//             });
//             if(!category)
//                 throw new TRPCError({code: "NOT_FOUND", message:"No category for the selected category id"});
//         }
    
//         if(input.skuIds){
//             const sku = await prisma.inventory.findMany({
//                     where: {
//                         SKU: {
//                             in: [...input.skuIds]
//                         }
//                     }
//                 });
//                 if(sku.length != input.skuIds.length)
//                     throw new TRPCError({code: "NOT_FOUND", message: "No device found for the sku id given"});
//         }
        
//         if(input.customisationOptionProductId){
//             const customisationOption = await prisma.products.findUnique({
//                 where: {
//                     id: input.customisationOptionProductId
//                 }
//             });
//             if(customisationOption)
//                 throw new TRPCError({code: "NOT_FOUND", message: "No product for the custom option opted"});
//         }
    
//         if(input.siblingProductId){
//             const siblingProduct = await prisma.products.findUnique({
//                 where: {
//                     id: input.siblingProductId
//                 }
//             });
//             if(!siblingProduct)
//                 throw new TRPCError({code: "NOT_FOUND", message: "No product for the sibling option opted"});
//         }
    
//         if(input.discountId){
//             const discount = await prisma.discounts.findUnique({
//                 where: {
//                     id: input.discountId
//                 }
//             })
//             if(!discount)
//                 throw new TRPCError({code: "NOT_FOUND", message: "No discount for the given Id"});
//         } 
    
//         const product = await prisma.products.update({
//             where: {
//                 id: input.productId
//             }, 
//             data: input
//         })
    
//         return {status:TRPCResponseStatus.SUCCESS, message:"", data: product};
//     } catch(error) {
//         //console.log("\n\n Error in deleteProductImage ----------------");
//         if (error instanceof Prisma.PrismaClientKnownRequestError) 
//             error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
//         throw TRPCCustomError(error);
//     } 
// };

/*
Delete a record from the DB,
Cascade is off so if any product id is being used in some inventory or anywhere else then it will
result in error
*/
export const deleteProductVariant =  async ({ctx, input} : TRPCRequestOptions<TDeleteProductVariantSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        await prisma.inventory.deleteMany({
            where: { productVariantId: input.variantId },
          });
        await prisma.productVariants.delete({
            where: {
                id: input.variantId,

            }
        }) 
        return {status:TRPCResponseStatus.SUCCESS, message:"Product deleted", data: {}};
    } catch(error) {
        //console.log("\n\n Error in deleteProductImage ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    } 
};