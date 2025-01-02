import { TRPCResponseStatus, TRPCAPIResponse, createError } from "@nonrml/common"
import { TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TcancelOrderProductSchema, TCancelOrderSchema, TEditOrderSchema, TGetUserOrderSchema, TInitiateOrderSchema, TTrackOrderSchema, TVerifyOrderSchema} from "./orders.schema";
import { Prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";import { createRZPOrder } from "../payments/payments.handler";
import crypto from 'crypto';
import { getPaymentDetials } from "@nonrml/payment";
/*
Get all the orders of a user
No pagination required for now, as the result quantity is gonna stay small
*/
export const getUserOrders = async ({ ctx } : TRPCRequestOptions<null>) => {
    const prisma = ctx.prisma;
    const userId = ctx.user?.id;
    //console.log(userId);
    try{
        const orders = await prisma.orders.findMany({
            where: {
                userId: userId,
                payment: {
                    paymentStatus: {
                        in: [prismaEnums.PaymentStatus.failed, prismaEnums.PaymentStatus.paid, prismaEnums.PaymentStatus.attempted]
                    }
                }
            },
            select:{
                id: true,
                orderStatus: true,
                totalAmount: true,
                createdAt: true,
                productCount: true,
                shipmentId: true,
                return: {
                    select:{
                        id: true
                    }
                },
                replacementOrder: {
                    select:{
                        id: true
                    }
                },
                payment:{
                    select: {
                        paymentStatus: true
                    }
                }
            },
            orderBy: [{
                "createdAt" : "desc"
            }]
        })
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: orders};
    } catch(error){
        // console.log("\n\n Error in getUserOrders ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error) 
    }
};

/*
Get all the orders of a user
No pagination required for now, as the result quantity is gonna stay small
*/
export const cancelOrder = async ({ ctx, input } : TRPCRequestOptions<TCancelOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        const cancelledOrder = await prisma.orders.update({
            where: {
                id: input.orderId,
                orderStatus: "CONFIRMED"
            },
            data: {
                orderStatus: "CANCELED"
            }
        })
        console.log(cancelledOrder);
        return {status: TRPCResponseStatus.SUCCESS, message: "", data: cancelledOrder};

    } catch(error){
        // console.log("\n\n Error in getUserOrders ----------------");
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
export const getUserOrder = async ({ctx, input}: TRPCRequestOptions<TGetUserOrderSchema | TTrackOrderSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let userIdsArray = ctx.user ? [ctx.user.id] : [];
        if('mobile' in input){
            // findMany because multiple related people can use same number to order in their address
            const userIds = await prisma.address.findMany({
                where: {
                    contactNumber: input.mobile
                },
                select: {
                    user: {
                        select: {
                            id: true
                        }
                    }
                }
            });
            if(userIds.length != 0){
                userIdsArray = [];
                for(let user of userIds){
                    userIdsArray.push(user.user.id);
                }
            } else {
                throw new TRPCError({code:"NOT_FOUND", message: "No Order Available With Given Mobile No."})
            }
        }
        const orderDetails = await prisma.orders.findUnique({
            where: {
                id: input.orderId!,
                userId: {
                    in: userIdsArray
                } 
            },
            include: {
                address: true,
                payment:{
                    select:{
                        paymentStatus: true
                    }
                },
                return: {
                    where:{
                        returnStatus: "PENDING"
                    },
                    select:{
                        id: true
                    }
                },
                replacementOrder: {
                    where: {
                        status: "PENDING"
                    },
                    select:{
                        id: true
                    }
                },
                orderProducts: {
                    select: {
                        id: true,
                        price: true,
                        quantity: true,
                        replacementQuantity: true,
                        rejectedQuantity: true,
                        returnQuantity: true,
                        productStatus: true,
                        productVariant: {
                            select: {
                                size: true,
                                productId:true,
                                product: {
                                    select: {
                                        name: true,
                                        id: true, 
                                        sku: true,
                                        productImages:{
                                            where:{
                                                priorityIndex: 0
                                            },
                                            select: {
                                                image: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if(!orderDetails?.id)
            throw new TRPCError({code:"NOT_FOUND", message: "No Details Available For Selected Order"})
        return { status: TRPCResponseStatus.SUCCESS, message:"", data: orderDetails};
    } catch(error) {
        //console.log("\n\n Error in getUserOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

/*
Verify razorpay signature after sucessful payment
*/
export const verifyOrder = async ({ctx, input}: TRPCRequestOptions<TVerifyOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    const userId = ctx.user?.id!;
    try{
        const orderDetails = await prisma.orders.findFirst({
            where: {
                userId: userId,
                payment: {
                    rzpOrderId: input.razorpayOrderId
                }
            },
            select:{
                id: true,
                payment: true,
                creditUtilised: true,
                totalAmount: true,
                creditNoteId: true
            }
        });
        if(!orderDetails || !orderDetails.payment)
            throw new TRPCError({code: "BAD_REQUEST", message: "Order not found"});

        const generated_signature = crypto.createHmac('sha256', "vQ3zPC5d2jh0USeUhsOd0jbe")
            .update(orderDetails.payment.rzpOrderId + "|" + input.razorpayPaymentId)
            .digest('hex');
        if (generated_signature != input.razorpaySignature) 
            throw new TRPCError({code: "BAD_REQUEST", message: "Payment signature verification failed"});

        const {method: paymentMethod} = await getPaymentDetials({rzpPaymentId: input.razorpayPaymentId})

        await prisma.payments.update({
            where: {
                id: orderDetails.payment.id,
                rzpOrderId: input.razorpayOrderId
            },
            data: {
                paymentStatus: prismaEnums.PaymentStatus.paid,
                rzpPaymentId: input.razorpayPaymentId,
                rzpPaymentSignature: input.razorpaySignature
            }
        });
        await prisma.orders.update({
            where: {
                id: orderDetails.id
            },
            data: {
                orderStatus: paymentMethod == "Cash on Delivery" ? prismaEnums.OrderStatus.CONFIRMED : prismaEnums.OrderStatus.ACCEPTED
            }
        });
        //console.log(Number(orderDetails.totalAmount) < orderDetails.creditUtilised!);
        orderDetails.creditNoteId && (
            Number(orderDetails.totalAmount) == orderDetails.creditUtilised! ? 
                await prisma.creditNotesPartialUseTransactions.create({
                    data : {
                        creditNoteId: orderDetails.creditNoteId,
                        orderId: orderDetails.id,
                        valueUtilised: Number(orderDetails.totalAmount) - 10
                    }
                }) : await prisma.creditNotes.update({
                    where:{
                        id: orderDetails.creditNoteId
                    },
                    data : {
                        redeemed: true
                    }
                })
        )

        return {status: TRPCResponseStatus.SUCCESS, message: "Payment verified", data: {orderId: orderDetails.id}};
    }catch(error){  
        //console.log("\n\n Error in verifyOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError)
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}

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
// Inventory Lock will be 
export const initiateOrder = async ({ctx, input}: TRPCRequestOptions<TInitiateOrderSchema>) => {
    input = input!;
    const userId = ctx.user?.id!;
    const prisma = ctx.prisma;
    try{
        let cnUseableValue = 0;
        let creditNoteId = null;
        let orderTotal = 0;
        if(input.creditNoteCode){
            const creditNote = await prisma.creditNotes.findFirst({
                where: {
                    creditCode: input.creditNoteCode,
                },
                include: {
                    creditNotesPartialUseTransactions: true
                }
            });
            if(!creditNote)
                throw new TRPCError({code:"NOT_FOUND", message: "No Credit note found for the given code"});
            
            creditNoteId = creditNote.id

            cnUseableValue = Number(creditNote.value);
            if(creditNote.creditNotesPartialUseTransactions.length != 0){
                for(let earlierTransactions of creditNote.creditNotesPartialUseTransactions){
                    cnUseableValue -= Number(earlierTransactions.valueUtilised);
                }
            } 
        }

        //product variant id/quantity/price verification
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

        let insufficientProductQuantities: typeof input.orderProducts = {};
        
        for (const variant of productValidation) {
            const orderProduct = input.orderProducts[variant.id];
            if ( (variant.inventory!.quantity + variant.inventory!.baseSkuInventory!.quantity) < orderProduct!.quantity ) {
                insufficientProductQuantities = {...insufficientProductQuantities, [variant.id] : { ...input.orderProducts[variant.id], quantity: 0}};
            }
            if (+variant.product.price !== orderProduct!.price) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Price mismatch for ${variant.product.name}`
                });
            }
            orderTotal += (+variant.product.price * orderProduct!.quantity);
        }

        if(Object.keys(insufficientProductQuantities).length != 0){
            return {
                status: TRPCResponseStatus.SUCCESS,
                message:"", 
                data: {
                    "updateQuantity": true,
                    insufficientProductQuantities
                }
            }
        }

        const paymentCreated = await createRZPOrder({ctx, input: {orderTotal: ( (orderTotal <= cnUseableValue) ? 10 : (orderTotal - cnUseableValue) ), addressId: input.addressId}});
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        let orderId = `ORD-${date}-${userId}-${randomPart}`;

        `
        
            125JAN1
        
        `
        const orderCreated = await prisma.$transaction(async (prisma) => {
            const order = await prisma.orders.create({
                data: {
                    id: orderId,
                    userId: userId,
                    totalAmount: orderTotal,
                    addressId: input.addressId,
                    creditNoteId: creditNoteId,
                    creditUtilised: orderTotal <= cnUseableValue ? orderTotal : cnUseableValue,
                    paymentId: paymentCreated.data.id,
                    productCount: Object.values(input.orderProducts).length
                },
                select:{
                    id: true,
                    address: {
                        select: {
                            contactName: true,
                            email: true
                        }
                    }
                }
            })
            const orderProducts = await prisma.orderProducts.createMany({
                data: Object.values(input.orderProducts).map((product) => ({
                    orderId: order.id,
                    productVariantId: product.variantId,
                    replacementQuantity: 0,
                    returnQuantity: 0,
                    quantity: product.quantity,
                    price: product.price
                }))
            });
           
            return {order, orderProducts};
        })
        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message:"", 
            data: {
                orderId: orderCreated.order.id,
                amount: +orderTotal*100, 
                rzpOrderId: paymentCreated.data.rzpOrderId, 
                contact: ctx.user?.contactNumber!, 
                name: orderCreated.order.address.contactName, 
                email: orderCreated.order.address.email
            }
        };
    }catch(error) {
        //console.log("\n\n Error in initiateOrder ----------------");
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
        //console.log("\n\n Error in editOrder ----------------");
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
        //console.log("\n\n Error in cancelOrderProduct ----------------");
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
        //console.log("\n\n Error in changeOrderStatus ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};