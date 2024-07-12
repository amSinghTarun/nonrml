import { publicProtectedProcedure } from "../../../procedures/authedProcedure";
import { procedure, router } from "../../../trpc";
import { addItemToCart, deleteItemFromCart, increaseItemQuantityInCart, getCartItems } from "./cartItems.handler";
import { ZAddCartItemSchema, ZEditCartItemSchema, ZDeleteCartItemSchema } from "./cartItems.schema";

// There will be nothing like get cart Item as when one click on the product in the cart
// they are directed to the product

export const cartItemRouter = router({
    getCartItems: publicProtectedProcedure
        .meta({ openAPI: {method: "GET", descrription: "Get the item added by the user in the cart"}})
        .query( async ({ctx, input}) => {
        return await getCartItems({ctx, input})
    }),
    addCartItem: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Add item to the cart"}})
        .input(ZAddCartItemSchema)
        .mutation( async ({ctx, input}) => {
        return await addItemToCart({ctx, input});
    }),
    editCartItem: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "Edit the item in cart, as in delete, increase quantity etc"}})
        .input(ZEditCartItemSchema)
        .mutation( async ({ctx, input}) => {
        return await increaseItemQuantityInCart({ctx, input});
    }),
    deleteCartItem: publicProtectedProcedure
        .meta({ openAPI: {method: "POST", descrription: "remove item from the cart"}})
        .input(ZDeleteCartItemSchema)
        .mutation( async ({ctx, input}) => {
        return await deleteItemFromCart({ctx, input});
    }),
});