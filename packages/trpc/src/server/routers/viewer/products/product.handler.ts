import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import {
  TAddProductSchema,
  TDeleteProductSchema,
  TEditProductSchema,
  TGetProductSchema,
  TGetProductsSchema,
  TGetProductsSizes,
  TVerifyCheckoutProductsSchema
} from "./product.schema";
import { Prisma, prisma } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";;
const take = 20;

export const getProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TGetProductSchema>) => {
  try {
    // check in redis if we have this. If yes don't fetch with product, if not then we do
    let categorySizeChart = null;

    //cache for less time
    let product = await prisma.products.findUniqueOrThrow({
      where: {
        id: input!.productId,
      },
      select: {
        name: true,
        description: true,
        price: true,
        id: true,
        care: true,
        details: true,
        soldOut: true,
        productImages: {
            select: {
                image: true,
                priorityIndex: true,
            },
            orderBy: {
                priorityIndex: "asc",
            },
        }, 
        category: categorySizeChart ? false
        : {
            select: {
                productCategorySize: {
                    select: {
                        sizeChart: true,
                    },
                },
            },
        },
      },
    });

    // set category sizechart cache
    if (!categorySizeChart)
      categorySizeChart = JSON.stringify(
        product.category?.productCategorySize!.sizeChart
      );

    //cache it and get from cache, delete at the time of order
    const productInventory = await prisma.productVariants.findMany({
        where: {
            productId: product.id,
        },
        select: {
            id: true,
            size: true,
            inventory: {
                select: {
                    quantity: true,
                    baseSkuInventory:{
                        select: {
                            quantity: true
                        }
                    }
                }
            }
        },
    });
    if (productInventory.length == 0)
      throw new Error(
        "The Product you are lookng for is not available for sale"
      );

    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "",
      data: { product, productInventory, categorySizeChart },
    };
  } catch (error) {
    //console.log("\n\n Error in getProduct ----------------");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error);
  }
};

/* 
Get all the products
Cursor besed pagination
Can apply filters
Don't check availability when only size filter is applied
The available/out of stock, can be checked through redis SKU cache
*/
export const getProducts = async ({
  ctx,
  input,
}: TRPCRequestOptions<TGetProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try {
    let paginationQuery:
      | { take: number; skip: 1; cursor: { id: number } }
      | { take: number } = { take: input.back ? -1 * take : take };
    if (input.lastId) {
      paginationQuery = {
        ...paginationQuery,
        skip: 1,
        cursor: {
          id: input.lastId,
        },
      };
    }

    // let queryJSON: typeof paginationQuery & { where?: any; select?: any } =
    //   paginationQuery;

    console.log("PRODUCT 1 --------------------------------- ");
    const products = await prisma.products.findMany({
      where: input.categoryName ? {
        category: {
          displayName: input.categoryName.replace("_", " "),
        },
      } : {},
      select: {
          id: true,
          name: true,
          price: true,
          soldOut: true,
          _count:{
              select: {
                ProductVariants: {
                    where: {
                        inventory: {
                            baseSkuInventory: {
                              quantity: { gt:0 }
                            },
                            quantity: { gt:0 }
                        }
                    }
                }
              }
          },
          productImages: {
              where: { active: true, priorityIndex:0 },
              select: {
                  image: true,
              }
          }
      },
      ...paginationQuery
    });
    console.log("PRODUCT 2 --------------------------------- ");


    // const product = await prisma.products.findMany(queryJSON);


    return { status: TRPCResponseStatus.SUCCESS, message: "", data: products };
  } catch (error) {
    console.log("\n\n ----------------------------- :: Error in getProducts");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error);
  }
};

export const getProductsSizes = async ({ ctx, input }: TRPCRequestOptions<TGetProductsSizes>) => {
  const prisma = ctx.prisma;
  input = input!;
  try{
    const productVariantSizes = await prisma.productVariants.findMany({
      where: {
        productId: {
          in: input
        }
      },
      select:{
        size: true,
        id: true,
        productId: true
      }
    });
    let productIdToVariantSizes : {[productId: number]: {variantId: number, size: string}[]} = {};
    for(let productVariant of productVariantSizes){
      if(!productIdToVariantSizes[productVariant.productId])
        productIdToVariantSizes[productVariant.productId] = []; 
      productIdToVariantSizes[productVariant.productId]?.push({variantId: productVariant.id, size: productVariant.size});
    }
    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "",
      data:  productIdToVariantSizes ,
    };
  } catch(error) {
    //console.log("\n\n Error in getProductSizes ----------------");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error); 
  }
}

/*
    make the available size qunatity concept using redis, don't put it in db
    althought the field hasn't been removed from the usage for now as for sake of implementation simplicity
*/
export const addProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TAddProductSchema>) => {
  try {
    const prisma = ctx?.prisma!;
    //console.log("INPUT ---------------- ", input);
    // If will auto check at the time of creating record, so no need to check manually
    // if(input.discountId){
    //     const discount = await prisma.discounts.findUnique({
    //         where: {
    //             id: input.discountId
    //         }
    //     })
    //     if(!discount)
    //         throw new TRPCError({code: "NOT_FOUND", message: "No discount for the given Id"});
    // }

    const product = await prisma.products.createMany({
      data: input!,
    });
    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "New product added",
      data: product,
    };
  } catch (error) {
    //console.log("\n\n Error in addingProduct ----------------");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error);
  }
};

export const verifyCheckoutProducts = async ({ctx, input} : TRPCRequestOptions<TVerifyCheckoutProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try{ 
    const productVariantIds = Object.keys(input.orderProducts).map(Number);
        const productValidation = await prisma.productVariants.findMany({
            where: {
                id: {
                    in: productVariantIds
                }
            },
            select: {
                id: true,
                product:{
                    select:{
                        price: true,
                        name: true
                    }
                },
                inventory: {
                    select: {
                        quantity: true,
                        baseSkuInventory: {
                            select: {
                                quantity: true
                            }
                        }
                    },
                },
            }
        });

        // Verify product variants and quantities and price
        if(productValidation.length !== Object.keys(input.orderProducts).length)
            throw new TRPCError({code: "BAD_REQUEST", message: "Invalid product variant ID"});
        for (const variant of productValidation) {
            const orderProduct = input.orderProducts[variant.id];
            if ( 1 < orderProduct!.quantity ) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Insufficient quantity for ${variant.product.name}`
                });
            }
            if (+variant.product.price !== orderProduct!.price) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Price mismatch for ${variant.product.name}`
                });
            }
            // orderTotal += (+variant.product.price * orderProduct!.quantity);
        }
  } catch(error) {
    throw TRPCCustomError(error);
  }
}

export const editProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TEditProductSchema>) => {
  try {
    if (input.categoryId) {
      const category = await prisma.productCategories.findUnique({
        where: {
          id: input.categoryId,
        },
      });
      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No category for the selected category id",
        });
    }

    if (input.skuIds) {
      const sku = await prisma.inventory.findMany({
        where: {
          SKU: {
            in: [...input.skuIds],
          },
        },
      });
      if (sku.length != input.skuIds.length)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No device found for the sku id given",
        });
    }

    if (input.customisationOptionProductId) {
      const customisationOption = await prisma.products.findUnique({
        where: {
          id: input.customisationOptionProductId,
        },
      });
      if (customisationOption)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No product for the custom option opted",
        });
    }

    if (input.siblingProductId) {
      const siblingProduct = await prisma.products.findUnique({
        where: {
          id: input.siblingProductId,
        },
      });
      if (!siblingProduct)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No product for the sibling option opted",
        });
    }

    if (input.discountId) {
      const discount = await prisma.discounts.findUnique({
        where: {
          id: input.discountId,
        },
      });
      if (!discount)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No discount for the given Id",
        });
    }

    const product = await prisma.products.update({
      where: {
        id: input.productId,
      },
      data: input,
    });

    return { status: TRPCResponseStatus.SUCCESS, message: "", data: product };
  } catch (error) {
    //console.log("\n\n Error in deleteProductImage ----------------");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error);
  }
};

/*
Delete a record from the DB,
Cascade is off so if any product id is being used in some inventory or anywhere else then it will
result in error
*/
export const deleteProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TDeleteProductSchema>) => {
  try {
    await prisma.products.delete({
      where: {
        id: input.productId,
      },
    });
    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "Product deleted",
      data: {},
    };
  } catch (error) {
    //console.log("\n\n Error in deleteProductImage ----------------");
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      error = {
        code: "BAD_REQUEST",
        message:
          error.code === "P2025"
            ? "Requested record does not exist"
            : error.message,
        cause: error.meta?.cause,
      };
    throw TRPCCustomError(error);
  }
};
    // include: { product: { include: { ProductImages : true } } }

    // let includeSearchString: { productInventoryMap?: any; productImages: any } =
    //   { productImages: { where: { priorityIndex: 0 } } };
    // if (input.size)
    //   includeSearchString.productInventoryMap = {
    //     inventory: { size: input.size },
    //   };

    // let searchRequest: { [key: string]: any } = {};
    // if (input.tags) searchRequest = { tags: { hasSome: input.tags } };
    // if (input.categoryName)
    //   searchRequest = {
    //     ...searchRequest,
    //     category: { displayName: input.categoryName.replace("_", " ") },
    //   };

    // // this might give performance issues
    // // productInventoryMap: true is added to ensure that only those products are included that are mapped
    // // to inventory
    // const outOfStockCountQuery = {
    //   productInventoryMap: true,
    //   _count: {
    //     select: {
    //       productInventoryMap: {
    //         where: { inventory: { quantity: { gt: 0 } } },
    //       },
    //     },
    //   },
    // };

    // queryJSON = Object.keys(searchRequest).length
    //   ? { ...queryJSON, where: searchRequest }
    //   : queryJSON;
    // queryJSON = Object.keys(includeSearchString).length
    //   ? {
    //       ...queryJSON,
    //       include: { ...includeSearchString, ...outOfStockCountQuery },
    //     }
    //   : { ...queryJSON, include: { ...outOfStockCountQuery } };