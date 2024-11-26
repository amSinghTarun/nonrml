import { Prisma, prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TRPCResponseStatus, TRPCAPIResponse } from "@nonrml/common";
import { TAddCartItemSchema, TEditCartItemSchema, TDeleteCartItemSchema } from "./cartItems.schema";
import { TRPCError } from "@trpc/server";

/*

* Get all the items from a cart.
* The return JSON include
cart items, product [name, price, primary photo], all the discounts available.
* Checks will be performed to ensure the availability of product w.r.t the selected quantity of a product, i.e 
the selected quantity will be checked again the available quantity in the inventory.
*/
export const getCartItems = async ({ctx} : TRPCRequestOptions<undefined>) => {
    try{
        const cartId = ctx?.user?.cartId;

        let cart = await prisma.cartItems.findMany({
            where: {
                cartId: cartId
            },
            include : {
                inventory: {
                    select: {
                        quantity: true
                    }
                },
                product: {
                    select: {
                        name: true,
                        finalPrice: true,
                    },
                    include: {
                        ProductImages: {
                            where: {
                                priorityIndex: 0 
                            }, 
                            select: {
                                image: true
                            }
                        }
                    }
                }
            }
        });
        
        if(!cart)
            throw new TRPCError({code:"NOT_FOUND", message:"No cart with the user selected"});
        
        // -------------------- This logic is commented as it can be handeled in UI.
        // In UI we can just compare the selected quantity with available quantity, if it's greater then we just show
        // warning that less items are left.
        // 
        // 
        // type CartItem = typeof cart[number] & {
        //     availabilityIssue: number
        // }
        // // availabilityIssue will show the number of item we are short in inventory from the selected quantity by user
        // // -1 will indicate that their is no issue, we have more then the required by customer
        // // any numerical value other than -1 will indicate the number of articles we are short
        // let cartItems : CartItem[] = []; 
        // for(let cartItem of cart) {
        //     let cartItemNew : CartItem = {...cartItem, availabilityIssue: -1};
        //     if (cartItem.inventory.quantity == 0) {
        //         cartItemNew.availabilityIssue = cartItem.inventory.quantity;
        //     } else if (cartItem.quantity > cartItem.inventory.quantity){
        //         cartItemNew.availabilityIssue = cartItem.quantity - cartItem.inventory.quantity; 
        //     }
        //     cartItems = [...cartItems, cartItemNew];
        // }
        // ------------------------ Keeping the code for future ref.

        // Will show all the discounts dispite of the applicability
        // will check the applicability condition when a user cick apply discount
        // will show all the discounts that have expiry greater then RN, only gt not gte, coz if we apply gte, the check will
        // be performed in epoch and by the time the result reach user, it will be expired
        const discounts = await prisma.discounts.findMany({
            where: {
                expiry: {
                    gt: `${Date.now()}`
                },
                status: prismaEnums.DiscountStatus.ACTIVE
            }
        });
        return {status:TRPCResponseStatus.SUCCESS, message:"Details for requested cart", data: {cart, discounts}};
        
    } catch(error) {
        //console.log("Error in getCartItems ----------------");
        throw TRPCCustomError(error);
    }
}

/*
Add a product to cart
Get the cartId from the CTX, in input we will get the SKU , as SKU is unique with every size so at time of processing we will
get the size from the SKU.
Get the details with SKU and after checking quantity and all, create cartItem entry and then increment the quantity and price of
cart by 1 product, as add to cart doesn't have custom quantity addition functionality, 
it means whenever someone will click add to cart, we will only 1 item of it, i.e keep the quantity as 1 by default.
*/
export const addItemToCart = async ({ctx, input}: TRPCRequestOptions<TAddCartItemSchema>)   => {
    try{
        const cartId = ctx?.user?.id;

        const productSKUDetails = await prisma.inventory.findUnique({
            where: {
                SKU: input.productSKU
            },
            include: {
                Product: true
            }
        });
        
        if(!productSKUDetails || !productSKUDetails.Product)
            throw new TRPCError({code:"NOT_FOUND", message:"No product found for given id"});
        if(productSKUDetails.quantity < 1)
            throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Out of Stock"});
    
        const item = await prisma.cartItems.create({
            data: {...input, quantity: 1, cartId: cartId!, productId: productSKUDetails.productId!, size: productSKUDetails.size}
        });
    
        await prisma.cart.update({
            where: {
                id: cartId
            },
            data: {
                cartTotal: {
                    increment: productSKUDetails.Product.finalPrice
                },
                quantity: {
                    increment: 1
                }
            }
        });
    
        return {status: TRPCResponseStatus.SUCCESS, message: "Item added to cart", data:item};
    } catch(error) {
        //console.log("\n\n Error in AddItemToCart --------------------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Increase / decrease quantit of prpduct in the cart through + - buttons.
We need the quantity in request coz the call can be for any increament/decrement
*/
export const editItemQuantityInCart = async ({ctx, input}: TRPCRequestOptions<TEditCartItemSchema>)   => {
    try{        
        const cartItem = await prisma.cartItems.findFirst({
            where: {
                cartId: input.cartItemId
            },
            include: {
                product: true,
                inventory: true
            }
        });
        if(!cartItem)
            throw new TRPCError({code: "NOT_FOUND", message:"No such item in cart"})
        if(!cartItem.product || !cartItem.inventory)
            throw new TRPCError({code:"NOT_FOUND", message:"No product found for given id"});
    
        const finalQuantity = cartItem.quantity + input.quantity;
        if(finalQuantity == 0) { // if cartItem.qquantity is becoming 0 then it means the quantity was 1 and input was
            // -1, so instead of cartItem.quantity i can simply use 1 directly
            await prisma.cartItems.delete({
                where: {
                    id: cartItem.id
                }
            });
            const cartUpdated = await prisma.cart.update({
                where: {
                    id: cartItem.cartId
                }, 
                data: {
                    cartTotal: {
                        decrement: cartItem.product.finalPrice // * 1 || cartItem.quantity
                    },
                    quantity: {
                        decrement: 1 //cartItem.quantity
                    }
                }
            });
            return { status: TRPCResponseStatus.SUCCESS, message:"Quantity updated", data: {cart: cartUpdated}};
        }
    
        if(cartItem.inventory.quantity < finalQuantity)
            throw new TRPCError({code:"CONFLICT", message:"Available quantity is less than requested"})
    
        const updatedcartItem = await prisma.cartItems.update({
            where: {
                id: cartItem.id
            }, 
            data: {
                quantity: finalQuantity
            }
        });
    
        const cartUpdateData = input.quantity < 0 ? {quantity:{decrement: 1}, cartTotal: {decrement: cartItem.product.finalPrice}} : {quantity: {increment: 1}, cartToral:{increment: cartItem.product.finalPrice}};
        // The above is modified query of the below command 
        //const cartUpdateData = input.quantity < 0 ? {quantity:{decrement: input.quantity}, cartTotal: {decrement: input.quantity*cartItem.product.finalPrice}} : {quantity: {increment: input.quantity}, cartToral:{increment: cartItem.product.finalPrice*input.quantity}};

        const cart = await prisma.cart.update({
            where:{
                id: cartItem.cartId
            },
            data: cartUpdateData
        });
    
        return {status: TRPCResponseStatus.SUCCESS, message: "Quantity updated", data:{cart: cart, cartItem: updatedcartItem}};
    } catch(error) {
        //console.log("\n\n Error in incrementItemQuantityInCart --------------------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error); 
    }
}

/*
    delete item from cart, here the negative quantity can be anything.
    Flow:
        Delete the item from cart
        decrease the quantity and amount from the cart
*/
export const deleteItemFromCart = async ({ctx, input}: TRPCRequestOptions<TDeleteCartItemSchema>)   => {
    try{
        const deleteCartItem = await prisma.cartItems.delete({
            where: {
                id: input.cartItemId
            },
            include: {
                product: true
            }
        });
        const cartUpdated = await prisma.cart.update({
            where: {
                id: ctx?.user?.cartId
            }, 
            data: {
                cartTotal: {
                    decrement: deleteCartItem.product.finalPrice * deleteCartItem.quantity
                },
                quantity: {
                    decrement: deleteCartItem.quantity
                }
            }
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "Item deleted", data:{cart: cartUpdated}};
    } catch(error) {
        //console.log("\n\n Error in deleteItemFromCart --------------------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error); 
    }
}