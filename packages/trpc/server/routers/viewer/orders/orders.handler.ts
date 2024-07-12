import { TRPCResponseStatus, TRPCAPIResponse, createError } from "@nonorml/common"
import { calculateDiscountedValue, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TcancelOrderProductSchema, TChangeOrderStatus, TEditOrderSchema, TGetUserOrderSchema, TInitiateOrderSchema} from "./orders.schema";
import { Prisma, prisma, prismaEnums } from "@nonorml/prisma";
import { TRPCError } from "@trpc/server";
import { orderProcedure } from "../../../procedures/authedProcedure";

/*
Get all the orders of a user
No pagination required for now, as the result quantity is gonna stay small
*/
export const getUserOrders = async ({ctx, input} : TRPCRequestOptions<undefined>) => {
    try{
        let userId = ctx?.user?.id;
        const orders = await prisma.orders.findMany({
            where: {
                userId: userId
            }
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: orders};
    } catch(error){
        console.log("\n\n Error in getUserOrders ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error) 
    }
};

/*
Get a particular order of a user
search in the orderProducts as all the products are stored there and include the order details and product details
in that only
*/
export const getUserOrder = async ({ctx, input}: TRPCRequestOptions<TGetUserOrderSchema>)  => {
    try{
        const orderDetails = await prisma.orderProducts.findMany({
            where: {
                orderId: input.orderId
            },
            include: {
                product: true,
                order: true
            }
        });
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: orderDetails};
    } catch(error) {
        console.log("\n\n Error in getUserOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/* 
depending on the payment integrator, the order routes may change
most probably this is to initiate the payment and then there will be one that the razorpay will hit
to give the payment confirmation;
and the shipment logic should be implemented in the confirmation logic 
create shipment for all the products, you can dso it in 1 order as said by the ithink logistics

Process:

Get the product details from the cart
the shipment is created from the change status function
*/
export const initiateOrder = async ({ctx, input}: TRPCRequestOptions<TInitiateOrderSchema>) => {
    try{
        let userId = ctx?.user?.id!;
        const address = await prisma.address.findFirst({
            where: {
                id: input.addressId
            }
        });
        if(!address)
            throw new TRPCError({code: "NOT_FOUND", message: "No address found with given id"});

        const discount = await prisma.discounts.findFirst({
            where: {
                id: input.discountId
            }
        });
        if(!discount)
            throw new TRPCError({code: "NOT_FOUND", message: "No discount found with the given id"});

        let orderBaseTotal = 0;
        let productSizeJson : {productId: number, price: number, size: string, orderId?: number, productSKU: string, quantity: number}[] = []
        let productCount = 0;

        if(input.directOrder) {
            const product = await prisma.inventory.findFirst({
                where: {
                    SKU: input.productDetails?.sku
                },
                include: {
                    Product: true
                }
            });

            if(!product?.id || !product?.Product)
                throw new TRPCError({code: "CONFLICT", message: `Product with SKU: ${input.productDetails?.sku} does not exist`});            

            if(input.productDetails?.quantity! > product.quantity!)
                throw new TRPCError({code: "CONFLICT", message: `Product id: ${product.productId} available quantity is less than the requuired`});

            orderBaseTotal += (product.Product.finalPrice * input.productDetails?.quantity!); 
            productCount = input.productDetails?.quantity!;
            productSizeJson.push({productId: product.productId!, price:product.Product.finalPrice, size: product.size, productSKU: product.SKU, quantity: input.productDetails?.quantity!});

        } else {
            const products = await prisma.cartItems.findMany({
                where: {
                    cartId: ctx?.user?.cartId
                },
                include: {
                    product: true,
                    inventory: true,
                    cart: true
                }
            });
            
            for(let product of products){
                if(!product.id){
                    throw new TRPCError({code: "CONFLICT", message: `Product with SKU: ${input.productDetails?.sku} does not exist`});            
                }
    
                if(product.cart.quantity > product.inventory.quantity){
                    throw new TRPCError({code: "CONFLICT", message: `Product ${product.id} availablr quantity is less than the requuired`});
                }
                productCount += product.quantity; 
                orderBaseTotal += (product.product.finalPrice * product.quantity);
                productSizeJson.push({productId: product.id, price: product.product.finalPrice, size: product.inventory.size, productSKU: product.inventory.SKU, quantity: product.quantity});
            }
    
        }
            
        let finalOrderPrice = calculateDiscountedValue(discount.discount, discount.type, orderBaseTotal);
        
        
        let orderData : Required<Omit<typeof input, "address"|"directOrder"|"productDetails">> = {...input, addressId: input.addressId!};
        
        if(!input.addressId){
            let { id } = await prisma.address.create({
                data: {
                    ...input.address!,
                    userId
                }
            })
            input.addressId = id;
        }

        // the payment status has to be pending here
        const order = await prisma.orders.create({
            data: {...orderData, userId, finalPrice: `${finalOrderPrice}`, paymentStatus: prismaEnums.PaymentStatus.PENDING, productCount}
        });
    
        let orderProductDetails : Required<typeof productSizeJson[number]>[] = [];
        for(let product of productSizeJson) {
            orderProductDetails.push({...product, orderId: order.id});
        }
    
        const orderProducts = await prisma.orderProducts.createMany({
            data: orderProductDetails
        });
        
        // maybe here i have to hit the payment initiate url of the razorpay 
        // use the finalPrice calculated for the razorpay
        // fill the payment id and status
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: {orderProducts, order}};

    } catch(error) {
        console.log("\n\n Error in initiateOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};        
    
// not so sure about it.
// maybe a route to confirm the payment.
export const editOrder = async ({ctx, input}: TRPCRequestOptions<TEditOrderSchema>) => {
    try{
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};
    } catch(error) {
        console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/*
User can cancel a single product or entire order based on their choice but only before the order is shipped.
Process:
    get the product|order detail and check for pending status
    cancel the shipment
    Calculate and initiaite the refund
    Update the status to cancelled
*/ 
export const cancelOrderProduct = async ({ctx, input}: TRPCRequestOptions<TcancelOrderProductSchema>)=> {
    try{
        let userId = ctx?.user?.id;        
        let updatedOrder = {};
        let grossRefundAmount = 0;

        if(input.productOrderId){
            let orderedProduct = await prisma.orderProducts.findUniqueOrThrow({
                where: {
                    id: input.productOrderId,
                    productStatus: prismaEnums.ProductStatus.PENDING
                },
                include: {
                    order: {
                        include: {
                            discount: true
                        }
                    }
                }
            });

            // cancel the shipment order

            grossRefundAmount = orderedProduct.price;
            if(orderedProduct?.order.discount?.type == prismaEnums.DiscountType.PERCENTAGE){
                grossRefundAmount -= ( grossRefundAmount * orderedProduct.order.discount.discount ) / 100 ;
            } else {
                grossRefundAmount -= orderedProduct.order.discount?.discount! / orderedProduct.order.productCount;
            }

            updatedOrder = await prisma.orderProducts.update({
                where: {
                    id: input.productOrderId
                }, 
                data: {
                    productStatus: prismaEnums.ProductStatus.CANCELED
                }
            });


    
        } else {    
            const order = await prisma.orders.findUniqueOrThrow({
                where: {
                    userId: userId, 
                    id: input.orderId
                },
                select: {
                    productCount: true,
                    finalPrice: true
                }
            });
            
            const products = await prisma.orderProducts.count({
                where: {
                    orderId: input.orderId,
                    OR: [
                        {
                            productStatus: prismaEnums.ProductStatus.PENDING,
                        },
                        {
                            productStatus: prismaEnums.ProductStatus.CANCELED,
                        }
                    ]
                }
            });
            
            
            if(order.productCount == products){
                // cancel the shipment order
                grossRefundAmount = <number><unknown>order.finalPrice;
                updatedOrder = await prisma.orderProducts.updateMany({
                    where: {
                        orderId: input.orderId
                    }, 
                    data :{
                        productStatus: prismaEnums.ProductStatus.CANCELED
                    }
                })
            } else {
                throw new TRPCError({code: "UNAUTHORIZED", message: "Can't cancel the order once it's Confirmed"});
            }
        }

        // return the payment  : grossRefundAmount

        return { status: TRPCResponseStatus.SUCCESS, message:"Order canceled", data: updatedOrder};

    } catch(error) {
        console.log("\n\n Error in cancelOrderProduct ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
} 

/*
Change the status of an order
Process:
    Switch between the status requested to be updated
    all will just update the db record except the confirmed and packed
    in confirmed, decrement the quantity form inventory
    in packed, create the shipment order
*/
export const ChangeOrderStatus = async ({ctx, input}: TRPCRequestOptions<TChangeOrderStatus>) => {
    try{
        // const order = await prisma.orders.findFirst({
        //     where: {
        //         id: input.orderId
        //     },
        //     select : {
        //         orderStatus: true
        //     }
        // });
        // if(!order)
        //     throw createError(404, `No such order with id: ${input.orderId}`);

        let orderUpdated = {}

        switch(input.status) {
            case(prismaEnums.OrderStatus.CONFIRMED):
                // decrease quantity
                const orderProducts = await prisma.orderProducts.findMany({
                    where: {
                        orderId: input.orderId
                    }
                });
                let queries = [];
                for(let product of orderProducts) {
                    let query = prisma.inventory.update({
                        where: {
                            SKU: product.productSKU
                        },
                        data: {
                            quantity: {
                                decrement: product.quantity
                            }
                        }
                    })
                    queries.push(query);
                }

                // update multiple record in 1 transaction
                const [updatedOrders] = await prisma.$transaction([
                    ...queries,
                    prisma.orders.update({ where: { id: input.orderId}, data: { orderStatus: prismaEnums.OrderStatus.CONFIRMED}})
                ]);
                orderUpdated = updatedOrders;
                break;
            case(prismaEnums.OrderStatus.PACKING):
                orderUpdated = await prisma.orders.update({ where: { id: input.orderId}, data: { orderStatus: prismaEnums.OrderStatus.PACKING}});
                break;
            case(prismaEnums.OrderStatus.PACKED):
                // create shipment
                orderUpdated = await prisma.orders.update({ where: { id: input.orderId}, data: { orderStatus: prismaEnums.OrderStatus.PACKED}});
                break;
            case(prismaEnums.OrderStatus.SHIPPED):
                orderUpdated = await prisma.orders.update({ where: { id: input.orderId}, data: { orderStatus: prismaEnums.OrderStatus.SHIPPED}});
                break;
            case(prismaEnums.OrderStatus.DELIVERED):
                orderUpdated = await prisma.orders.update({where: {id: input.orderId}, data: {orderStatus: prismaEnums.OrderStatus.DELIVERED, deliveryDate: Date.now()}})
                break;
            default: 
                break;
        }

        return { status: TRPCResponseStatus.SUCCESS, message: "Status updated", data: orderUpdated};

    } catch(error) {
        console.log("\n\n Error in changeOrderStatus ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};