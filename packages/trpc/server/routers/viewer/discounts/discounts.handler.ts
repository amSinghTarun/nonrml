import { Prisma, prisma, prismaEnums } from "@nonorml/prisma";
import { TRPCError } from "@trpc/server";
import { calculateDiscountedValue, checkAdmin, TRPCCustomError } from "../helper";
import { TRPCRequestOptions } from "../helper";
import { TAddDiscountSchema, TApplyDiscountSchema, TDeleteDiscountItem, TEditDiscountSchema, TGetDiscountsSchema } from "./discounts.schema";
import { TRPCResponseStatus, TRPCAPIResponse } from "@nonorml/common";

// check and apply the discount to the items in cart.
// check all the condition, against all the items in the cart and if satisfied apply the discount.
// apply the coupon on item not cart, but only 1, like if there are trouser and tshirt in the cart and the user
// select the tshirt coupon so just apply the coupon on the tshirts and leave the rest as it, don't follow the
// approach that "cart has other item then thsirt so can't apply the coupon"
/*
get discount details 
get the cart items
check the conditons of discount
if not error, apply discount and return the discounted value
*/
export const applyDiscount = async ({ctx, input}: TRPCRequestOptions<TApplyDiscountSchema> )   => {
    try{
        const cartId = ctx?.user?.cartId;
        const userId = ctx?.user?.id;

        const discount = await prisma.discounts.findFirst({
            where: {
                expiry: {
                    gte: `${Date.now()}`
                },
                status: prismaEnums.DiscountStatus.ACTIVE,
                id: input.discountId
            },
            include: {
                discountCondition: true
            }
        });
        if(!discount)
            throw new TRPCError({code:"NOT_FOUND", message: "No discount found for the given id"});
    
        const cart = await prisma.cart.findUnique({
            where: {
                id: cartId
            }
        })
        if(!cart)
            throw new TRPCError({ code:"NOT_FOUND", message:"No cart found for the given id" });
    
        const cartItems = await prisma.cartItems.findMany({
            where: {
                id: cartId
            },
            include: {
                product: true
            }
        });
        
        //check condition of type for user
        if(discount.discountCondition?.conditionForUser == prismaEnums.DiscountConditionsTypeForUser.FIRST_ORDER){
            const userFirstOrder = await prisma.orders.findFirst({
                where: {
                    userId: userId
                }
            });
            if(userFirstOrder)
                throw new TRPCError({code:"BAD_REQUEST", message: "Discount can only be used for first order"})
            
        } else if(discount.discountCondition?.conditionForUser == prismaEnums.DiscountConditionsTypeForUser.USE_ONCE) {
            const userUsedDicounts = await prisma.userDiscounts.findFirst({
                where: {
                    userId: userId,
                    discountId: discount.id
                }
            });
            if(userUsedDicounts)
                throw new TRPCError({code:"BAD_REQUEST", message: "Discount can only be used once"})            
        }   
        //check if discount can only be applied in category
        let cartTotalAmount = cart.cartTotal;
        if(discount.discountCondition?.productCategoryId){
            for(let item of cartItems) {
                if(item.product.categoryId != discount.discountCondition?.productCategoryId){
                    cartTotalAmount -= item.product.finalPrice;
                }
            }
            if(cartTotalAmount == 0)
                throw new TRPCError({code: "BAD_REQUEST", message: "Discount can't be applied as desired category product is not present"});
        }
        // check if order fits well between min and max value
        const discountPriceCondition = discount.discountCondition?.minValue ? "Min" : discount.discountCondition?.maxValue ? "Max" : null;
        if(discountPriceCondition){
            if(discountPriceCondition == "Min" && discount.discountCondition?.minValue! >= cartTotalAmount)
                throw new TRPCError({code:"BAD_REQUEST", message: `Discount can only be applied on an order of more then ${discount.discount}`});
            else if(discountPriceCondition == "Max" && discount.discountCondition?.maxValue! <= cart.cartTotal)
                throw new TRPCError({code:"BAD_REQUEST", message: `Discount can only be applied on an order of less then ${discount.discount}`});
        }
        
        const finalCartPrice = cart.cartTotal - calculateDiscountedValue(discount.discount, discount.type, cartTotalAmount);
    
        return { status: TRPCResponseStatus.SUCCESS, message:"Discount applied", data:{cart: {cartTotal: finalCartPrice}}};
    } catch(error) {
        console.log("\n\n Error in applyDiscounts ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Get all the with preffered status and expiry, irrrespective of the type and category
*/
export const getDiscounts = async ({ctx, input}: TRPCRequestOptions<TGetDiscountsSchema>) => {
    try{
        const discounts = await prisma.discounts.findMany({
            where: {
                expiry : {
                    gt: input.expiry
                },
                status: input.status
            }, 
            include: {
                discountCondition: true
            }
        });
        return {status: TRPCResponseStatus.SUCCESS, message:"", data: discounts};
    } catch(error) {
        console.log("\n\n Error in getDiscounts ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};

/*
add discount in the db. Can only be done by ADMIN
*/
export const addDiscount = async ({ctx, input}: TRPCRequestOptions<TAddDiscountSchema>)  => {
    try{
        const discount = await prisma.discounts.create({
            data: input
        });
        return {status: TRPCResponseStatus.SUCCESS, message: "Discount added", data: discount};
    } catch(error) {
        console.log("\n\n Error in addDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);    
    }
}

/*
edit the db discount, ADMIN method
Any discount detail can be edited, wether it be it's condition or discount property
Directly update the discount, if the discount or it's corresponding condition doesn't exist
then it will be caught in error
*/
export const editDiscount = async ({ctx, input}: TRPCRequestOptions<TEditDiscountSchema>)   => {
    try{
        const discountEditted = await prisma.discounts.update({
            where: {
                id: input.id
            },
            data: input
        })
    
        return {status: TRPCResponseStatus.SUCCESS, message:"Discount editted", data: discountEditted}
    } catch(error) {
        console.log("\n\n Error in editDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
}

/*
Delete a respective discount
*/
export const deleteDiscount = async ({ctx, input}: TRPCRequestOptions<TDeleteDiscountItem>)   => {
    try{
        await prisma.discounts.delete({
            where: {
                id: input.id
            }
        })
        return { status: TRPCResponseStatus.SUCCESS, message:"Discount deleted", data: {}}
    }catch(error){
        console.log("\n\n Error in deleteDiscount ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error);
    }
};