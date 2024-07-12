import { procedure, router } from "../../../trpc";
import { deleteItemFromCart } from "../cartItems/cartItems.handler";
import { ZDeleteCartItemSchema } from "../cartItems/cartItems.schema";
import { addWishlistItem, getWishlist } from "./wishlist.handler";
import { ZAddWishlistItemsSchema } from "./wishlist.schema";

export const wishlistItemRouter = router({
    addItemTowishlist: procedure
        .meta({ openAPI: {method: "POST", descrription: "Add item to wishlist"}})
        .input(ZAddWishlistItemsSchema).mutation( async ({ctx, input}) => {
            return await addWishlistItem({ctx, input});
        }),
    getWishlist: procedure
        .meta({ openAPI: {method: "GET", descrription: "Get items of wishlist"}})
        .query( async ({ctx, input}) => {
            return await getWishlist({ctx, input});
        }), 
    deleteItemFromCart: procedure
        .meta({ openAPI: {method: "POST", descrription: "Delete wishlist item"}})
        .input(ZDeleteCartItemSchema).mutation( async ({ctx, input}) => {
            return await deleteItemFromCart({ctx, input})
        })
});