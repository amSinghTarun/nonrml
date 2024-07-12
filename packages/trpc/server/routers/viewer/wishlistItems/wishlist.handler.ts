import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";
import { TRPCRequestOptions } from "../helper";
import { TAddWishlistItemsSchema, TDeleteWishlistItemsSchema } from "./wishlist.schema";
import { prisma } from "@nonorml/prisma";
import { TRPCError } from "@trpc/server";

export const getWishlist = async ({ctx, input}: TRPCRequestOptions<undefined>)   => {
    let userId = ctx?.user?.id;
    const wishlist = await prisma.wishListItems.findMany({
        where: { userId }
    })
    return {status: TRPCResponseStatus.SUCCESS, message: "", data:wishlist};
}

export const addWishlistItem = async ({ctx, input}: TRPCRequestOptions<TAddWishlistItemsSchema>)   => {
    const product = await prisma.products.findFirst({
        where: {
            id: input.productId
        }
    });

    if(!product)
        throw new TRPCError({code:"NOT_FOUND", message:"No product with the given id"});

    const newItem = await prisma.wishListItems.create({
        data: input
    });
    
    return {status: TRPCResponseStatus.SUCCESS, message: "", data: newItem};
}

export const deleteWishlistItem = async ({ctx, input}: TRPCRequestOptions<TDeleteWishlistItemsSchema>)   => {
    await prisma.wishListItems.delete({
        where: {
            id: input.wishlistItemsId
        }
    });
    return {status: TRPCResponseStatus.SUCCESS, message: "", data:{}};
}