import { TRPCResponseStatus } from "@nonrml/common";
import { getSizeOrderIndex, TRPCCustomError, TRPCRequestOptions } from "../helper";
import {
  TAddProductSchema,
  TEditProductSchema,
  TGetProductSchema,
  TGetProductsSchema,
  TGetProductsSizes,
  TVerifyCheckoutProductsSchema,
  TGetProductVariantQuantitySchema,
  TGetHomeProductsSchema,
  TGetRelatedProductsSchema
} from "./product.schema";
import { Prisma, prismaTypes } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { customCacheJSONIncr } from "@nonrml/cache";
const take = 10;
import { cacheServicesRedisClient } from "@nonrml/cache"

/*
 Get the product details and also sizes for all the variants available
*/
export const getProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TGetProductSchema>) => {
  const prisma = ctx.prisma
  input = input!
  try {
    console.log("\n\n\n\n\n GET PRODUCTS");
    
    //cache tpo track number of visit on a product
    customCacheJSONIncr({ key: "VISITED", path: input.productSku });
    
    type ProductType = Omit<prismaTypes.Products, "createdAt"|"exclusive"|"updatedAt"|"tags"|"colour"> & {
      productImages: {
        image: string;
        priorityIndex: number;
      }[],
      category: {
        sizeChartId: number | null,
        displayName: string | null
      }
    } | null
    
    
    //cache for less time
    let product : ProductType = await cacheServicesRedisClient().get(`product_${input!.productSku}`);
    if(!product){
      product = await prisma.products.findUniqueOrThrow({
        where: {
          sku: input!.productSku.toUpperCase(),
          public: true
        },
        select: {
          visitedCount: true,
          public: true,
          sizeChartId: true,
          inspiration: true,
          shippingDetails: true,
          name: true,
          description: true,
          latest: true,
          price: true,
          id: true,
          sku: true,
          care: true,
          details: true,
          soldOut: true,
          categoryId: true,
          category: {
            select: {
              sizeChartId: true,
              displayName: true
            }
          },
          productImages: {
            select: {
              image: true,
              priorityIndex: true,
            },
            orderBy: {
              priorityIndex: "asc",
            },
          }
        }
      });
      cacheServicesRedisClient().set(`product_${product.sku}`, product, {ex:60*60*2});
    };
    
    //cache it and get from cache, delete at the time of order
    let productSizeQuantities : {[variantId: number]: {size: string, quantity: number, variantId: number}}|null = await cacheServicesRedisClient().get(`productVariantQuantity_${product.id}`);

    console.log("cached", productSizeQuantities);

    if(!productSizeQuantities) {
      
      productSizeQuantities = {};

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
        }
      });

      if (productInventory.length == 0)
        throw new TRPCError({code:"BAD_REQUEST", message: "The Product you are lookng for is not available"});

      for(let productVariant of productInventory){
        let quantity = (productVariant.inventory?.quantity || 0) + (productVariant.inventory?.baseSkuInventory?.quantity || 0)
        productSizeQuantities = {
          ...productSizeQuantities,
          [productVariant.id] : {
            size: productVariant.size,
            quantity: quantity,
            variantId: productVariant.id
          }
        };
      }
      
      // see how to expire this
      cacheServicesRedisClient().set(`productVariantQuantity_${product.id}`, productSizeQuantities, {ex: 60*60*5})
    }
    // the above cache if logic is not delete as it this cache is managed
    // on 2-3 places so let it be rn

    // Sort the inventory items by size before creating the object 
    // and send front this for size button
    // and they are maintained by the above cache as the logic is cache was being
    // used previously and so now it's complicated to remove it also it is 
    // actually effectient as we are going work of 2 places
    // const sortedInventory = Object.values(productSizeQuantities).sort((a, b) => {
    //   const aIndex = getSizeOrderIndex(a.size);
    //   const bIndex = getSizeOrderIndex(b.size);
      
    //   // If they have different order indices, sort by that
    //   console.log(aIndex, bIndex)
    //   if (aIndex !== bIndex) {
    //     return aIndex - bIndex;
    //   }
      
    //   return a.size.localeCompare(b.size);
    // });

    console.log("\n\n\n\n\n -----END");

    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "",
      data: { product: product!, sizeData: productSizeQuantities },
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
 Get the product details and also sizes for all the variants available
*/
export const getAdminProduct = async ({
  ctx,
  input,
}: TRPCRequestOptions<TGetProductSchema>) => {
  const prisma = ctx.prisma
  input = input!
  try {
    console.log("\n\n\n\n\n GET PRODUCTS");
    
    const product = await prisma.products.findUniqueOrThrow({
      where: {
        sku: input!.productSku.toUpperCase(),
      },
      select: {
        visitedCount: true,
        name: true,
        description: true,
        price: true,
        id: true,
        colour: true,
        sku: true,
        care: true,
        details: true,
        soldOut: true,
        categoryId: true,
        tags: true,
        discounts: true,
        exclusive: true,
        category: {
          select: {
            categoryName: true, 
            id: true,
            sizeChartId: true
          }
        },
        productImages: true,
        sizeChartId: true,
        ProductVariants: {
          select: {
            id: true,
            size: true,
            subSku: true,
            createdAt: true,
            inventory: {
              select: {
                quantity: true,
                baseSkuInventory: {
                  select: {
                    id: true
                  }
                },
                id: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    const sizeChartWithValues = await prisma.sizeChart.findFirst({
      where: {
        parentId: product.sizeChartId ?? product.category.sizeChartId,
      },
      select: {
        id: true,
        other_SizeChart: {
          where: {
            type: "SIZE_VALUE"
          },
          distinct: ["name"],
          select: {
            name: true
          }
        }
      }
    });
    
    // Now you can access the values as:
    const sizeChartValues = sizeChartWithValues?.other_SizeChart || [];

    const categories = await prisma.productCategory.findMany();

    console.log("\n\n\n\n\n -----END", sizeChartValues);

    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "",
      data: { product: product!, categories: categories, avlSizes: sizeChartValues },
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
- get the quantity for a products variant
*/
export const getProductVariantQuantity = async ({ctx, input}: TRPCRequestOptions<TGetProductVariantQuantitySchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try{
    
    let productSizeQuantities : {[variantId: number]: {size: string, quantity: number, variantId: number}}|null = await cacheServicesRedisClient().get(`productVariantQuantity_${input.productId}`);
    console.log(productSizeQuantities);
    if(!productSizeQuantities) {
      productSizeQuantities = {};
      const productInventory = await prisma.productVariants.findMany({
        where: {
          productId: input.productId,
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
        }
      });

      if (productInventory.length == 0)
        throw new TRPCError({code:"BAD_REQUEST", message: "The Product you are lookng for is not available"});

      for(let productVariant of productInventory){
        let quantity = (productVariant.inventory?.quantity || 0) + (productVariant.inventory?.baseSkuInventory?.quantity || 0)
        productSizeQuantities = {
          ...productSizeQuantities,
          [productVariant.id] : {
            size: productVariant.size,
            quantity: quantity,
            variantId: productVariant.id
          }
        };
      }
      console.log(productSizeQuantities);
      // see how to expire this
      cacheServicesRedisClient().set(`productVariantQuantity_${input.productId}`, productSizeQuantities, {ex: 60*60*5})
    }

    return {
      status: TRPCResponseStatus.SUCCESS,
      message: "",
      data: {productSizeQuantities},
    };

  } catch ( error ) {
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
Get all the products
Cursor besed pagination
Can apply filters
Don't check availability when only size filter is applied
The available/out of stock, can be checked through redis SKU cache
*/
export const getProducts = async ({ ctx, input }: TRPCRequestOptions<TGetProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n PRODUCT start --------------------------------- ", input);
    
    type LatestProducts = {
      price: number;
      sku: string;
      name: string;
      id: number;
      soldOut: boolean;
      public?: boolean,
      // latest: boolean,
      // sizeChartId: number | null,
      // visitedCount: number,
      // exclusive: boolean,
      productImages: {
          image: string;
      }[];
      _count: {
          ProductVariants: number;
      };
      updatedAt:Date
    }[] | null

    let latestProducts : LatestProducts = ( input.cursor == 1 ) ? await cacheServicesRedisClient().get("allClientProducts") : null;
    console.log(await prisma.user.findMany())
    if(!latestProducts || !latestProducts.length){
      latestProducts = await prisma.products.findMany({
        take: ( input.take ?? take) + 1,
        ...(input.cursor && {cursor: {id: input.cursor}}),
        where: {
          ...( input.categoryName && {category: {displayName: input.categoryName.replace("_", " ")}} ),
          public: true
        },
        select: {
          name: true,
          price: true,
          id: true,
          soldOut: true,
          public: true,
          // exclusive: true,
          sku: true,
          updatedAt: true,
          // latest: true,
          // visitedCount: true,
          // sizeChartId: true,
          _count:{
            select: {
              ProductVariants: {
                where: {
                  inventory: {
                    OR: [
                      {baseSkuInventory: { quantity: { gte: 1} }},
                      {quantity: {gte: 1}}
                    ]
                  }
                },
              }
            }
          },
          productImages: {
            where: { active: true, priorityIndex: 0 },
            select: {
              image: true,
            }
          }
        },
        orderBy: [
          { createdAt: "desc" }
        ]
      });
      latestProducts.length && cacheServicesRedisClient().set("allClientProducts", latestProducts, {ex: 60*5});
      console.log(latestProducts, "PRODUCTs END ---------------------------------", "\n\n\n\n\n");
    }

    let nextCursor: number | undefined = undefined;
    if (latestProducts && latestProducts.length >= take) {
      const nextItem = latestProducts.pop();
      nextCursor = nextItem?.id;
    }

    return { status: TRPCResponseStatus.SUCCESS, message: "", data: latestProducts, nextCursor: nextCursor };
  } catch (error) {
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

export const getRelatedProducts = async ({ctx, input}: TRPCRequestOptions<TGetRelatedProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!
  try{
    const relatedProduct = await prisma.products.findMany({
      where: {
        categoryId : input.categoryId,
        soldOut: false,
        public: true,
        NOT: {
          id: input.productId
        },
      },
      select: {
        sku: true,
        name: true,
        productImages: {
          where: { active: true, priorityIndex: 0 },
          select: {
            image: true,
          }
        },
        price: true,
      },
      orderBy: [
        { visitedCount: "desc" },
        { createdAt: "desc" }
      ]
    })
    return { status: TRPCResponseStatus.SUCCESS, message: "", data: relatedProduct };
  } catch(error) {
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

export const getAdminProducts = async ({ ctx, input }: TRPCRequestOptions<TGetProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try {
    
    type LatestProducts = {
      price: number;
      sku: string;
      name: string;
      id: number;
      soldOut: boolean;
      public?: boolean,
      latest: boolean,
      sizeChartId: number | null,
      visitedCount: number,
      exclusive: boolean,
      // productImages: {
      //     image: string;
      // }[];
      _count: {
          ProductVariants: number;
      };
    }[] | null

    // let latestProducts : LatestProducts = ( input.cursor == 1 && !input?.admin )? await cacheServicesRedisClient().get("allClientProducts") : null;

    // if(!latestProducts || !latestProducts.length){
    let latestProducts = await prisma.products.findMany({
      take: ( input.take ?? take) + 1,
      ...(input.cursor && {cursor: {id: input.cursor}}),
      where: {
        ...( input.categoryName && {category: {displayName: input.categoryName.replace("_", " ")}} ),
      },
      select: {
        name: true,
        price: true,
        id: true,
        soldOut: true,
        public: true,
        exclusive: true,
        sku: true,
        latest: true,
        visitedCount: true,
        sizeChartId: true,
        _count:{
          select: {
            ProductVariants: {
              where: {
                inventory: {
                  OR: [
                    {baseSkuInventory: { quantity: { gte: 1} }},
                    {quantity: {gte: 1}}
                  ]
                }
              },
            }
          }
        },
        // productImages: {
        //   where: { active: true, priorityIndex: 0 },
        //   select: {
        //     image: true,
        //   }
        // }
      },
      orderBy: [
        { createdAt: "desc" }
      ]
    });
      // latestProducts.length && cacheServicesRedisClient().set("allClientProducts", latestProducts, {ex: 60*5});
    // }
    // console.log(latestProducts, "PRODUCTs END ---------------------------------", "\n\n\n\n\n");
    let nextCursor: number | undefined = undefined;
    if (latestProducts && latestProducts.length >= take) {
      const nextItem = latestProducts.pop();
      nextCursor = nextItem?.id;
    }

    return { status: TRPCResponseStatus.SUCCESS, message: "", data: latestProducts, nextCursor: nextCursor };
  } catch (error) {
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
Get the products for homepage
Cursor besed pagination
Can apply filters
Don't check availability when only size filter is applied
The available/out of stock, can be checked through redis SKU cache
*/
export const getHomeProducts = async ({
  ctx,
  input,
}: TRPCRequestOptions<TGetHomeProductsSchema>) => {
  const prisma = ctx.prisma;
  input = input!;
  try {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n PRODUCT IN --------------------------------- ", input);
    let latestProducts, exclusiveProducts, popularProducts;
    if(input.latest){
      ///cache here as ALL no FILTER products, it can be used in the all products page, for an hour or so
      latestProducts = await prisma.products.findMany({
        // skip: input.cursor == 1 ? 0 : 1,
        take: take + 1,
        where: {
          public: true,
          latest: true
        },
        select: {
          name: true,
          soldOut: true,
          sku: true,
          price: true,
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
            where: { active: true },
            select: {
              image: true,
            },
            orderBy: [
              {priorityIndex: "asc"}
            ],
            take: 2
          }
        },
        orderBy: [
          { createdAt: "desc" }
        ]
      });
      cacheServicesRedisClient().set("latestProducts", latestProducts, {ex: 60*5});
    }

    if(input.exclusive){
      // Cache this as exclusive page, it can be cached for a long time as no quantity and shit, 1 day
      exclusiveProducts = await prisma.products.findMany({
        where: {
          exclusive: true,
          public: true
        },
        select: {
          name: true,
          sku: true,
          productImages: {
            where: { active: true, priorityIndex: 0 },
            select: {
              image: true,
            }
          }
        }
      });
      cacheServicesRedisClient().set("exclusiveProducts", exclusiveProducts, {ex: 60*60*60*24});
    }

    if(input.popular){
      // cache this as popular products, can be cached for 1 hour or so, the popular products don't change but the product quantity can
      popularProducts = await prisma.products.findMany({
        take: 4,
        where: {
          public: true,
          latest: false,
          exclusive: false
        },
        select: {
          name: true,
          price: true,
          sku: true,
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
            where: { active: true },
            select: {
              image: true,
            },
            orderBy: [
              {priorityIndex: "asc"}
            ],
            take: 2
          }
        },
        orderBy: [
          { createdAt: "desc" },
          { visitedCount: "desc" }
        ]
      });
      cacheServicesRedisClient().set("popularProducts", popularProducts, {ex: 60*60*60});
    }

    console.log("PRODUCT OUT ---------------------------------\n\n\n\n\n");
    return { status: TRPCResponseStatus.SUCCESS, message: "", data: { latestProducts, popularProducts, exclusiveProducts } };

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

/*
- Get the size of all the products user requested to exchange;
- For now in exhange we don't show what are available quantity, we accept the exchange order irrespective of the quantity 
  and later if the quantity is not apt we issue credit note.
*/
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
  const prisma = ctx?.prisma!;
  input = input!;
  try {
    
    const product = await prisma.products.create({
      data: input,
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
  const prisma = ctx.prisma;
  input = input!
  try {
    console.log(input)

    const updateData = {
      ...(input.name && {name: input.name}),
      ...(input.description && {description: input.description}),
      ...(input.inspiration && {description: input.inspiration}),
      ...(!isNaN(Number(input.price)) && {price: input.price}),
      ...(!isNaN(Number(input.categoryId)) && {categoryId: input.categoryId}),
      ...(input.colour && {colour: input.colour}),
      ...(input.care && {care: input.care}),
      ...(input.shippingDetails && {care: input.shippingDetails}),
      ...(input.details && {details: input.details}),
      ...(input.tags && {tags: input.tags}),
      ...(input.soldOut !== undefined && {soldOut: input.soldOut}),
      ...(input.exclusive !== undefined && {exclusive: input.exclusive}),
      ...(input.public !== undefined && {public: input.public}),
      ...(input.latest !== undefined && {latest: input.latest}),
      ...(isNaN(Number(input.sizeChartId)) !== undefined && {sizeChartId: input.sizeChartId! < 0 ? null : input.sizeChartId })
    }

    if(!Object.keys(updateData).length) // i think this can be removed
      throw { code:"BAD_REQUEST", message: "ATLEAST NEED 1 FIELD TO UPDATED"}

    if ("categoryId" in updateData) {
      const category = await prisma.productCategory.findUnique({
        where: {
          id: updateData.categoryId,
        },
      });
      if(!category) 
        throw { code: "NOT_FOUND", message: "No category for the selected category id" };
    }

    await prisma.products.update({
      where: {
        id: input.productId,
      },
      data: updateData,
    });

    return { status: TRPCResponseStatus.SUCCESS, message: "", data: {} };
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
// export const deleteProduct = async ({
//   ctx,
//   input,
// }: TRPCRequestOptions<TDeleteProductSchema>) => {
//   try {
//     await prisma.products.delete({
//       where: {
//         id: input.productId,
//       },
//     });
//     return {
//       status: TRPCResponseStatus.SUCCESS,
//       message: "Product deleted",
//       data: {},
//     };
//   } catch (error) {
//     //console.log("\n\n Error in deleteProductImage ----------------");
//     if (error instanceof Prisma.PrismaClientKnownRequestError)
//       error = {
//         code: "BAD_REQUEST",
//         message:
//           error.code === "P2025"
//             ? "Requested record does not exist"
//             : error.message,
//         cause: error.meta?.cause,
//       };
//     throw TRPCCustomError(error);
//   }
// };
