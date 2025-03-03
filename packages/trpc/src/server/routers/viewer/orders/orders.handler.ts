import { TRPCResponseStatus } from "@nonrml/common"
import { acceptOrder, calculateRejectedQuantityRefundAmounts, getDateRangeForQuery, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelOrderSchema, TEditOrderSchema, TGetAllOrdersSchema, TGetOrderSchema, TGetUserOrderSchema, TInitiateOrderSchema, TInitiateUavailibiltyRefundSchema, TTrackOrderSchema, TVerifyOrderSchema} from "./orders.schema";
import { Prisma, prismaEnums } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";import { createRZPOrder } from "../payments/payments.handler";
import crypto from 'crypto';
import { getPaymentDetials } from "@nonrml/payment";
const returnExchangeTime = 604800000; // 7 days
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
                // Payments: {
                //     some : {
                //         paymentStatus: {
                //             in: [prismaEnums.PaymentStatus.failed, prismaEnums.PaymentStatus.paid, prismaEnums.PaymentStatus.attempted]
                //         }
                //     }
                // }
            },
            select:{
                id: true,
                orderStatus: true,
                totalAmount: true,
                createdAt: true,
                productCount: true,
                shipmentId: true,
                return: {
                    where: {
                        returnType: "RETURN"
                    },
                    select:{
                        id: true
                    }
                },
                replacementOrder: {
                    select:{
                        id: true,
                    }
                },
                Payments:{
                    select: {
                        paymentStatus: true
                    },
                    orderBy: [{
                        createdAt: "desc"
                    }]
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
                creditNote: {
                    select: {
                        creditCode: true
                    }
                },
                Payments:{
                    select:{
                        paymentStatus: true
                    }
                },
                return: { //so that I can show that you can make another return once the prev one is accept to ship
                    where:{
                        returnStatus: "PENDING"
                    },
                    select:{
                        id: true
                    }
                },
                replacementOrder: { //so that I can show that you can make another return once the prev one is accept to ship
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
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '').slice(4);
        const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
        let orderId = `ORD-${date}${userId}${randomPart}`;

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
                    productCount: Object.values(input.orderProducts).length,
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
            const orderProducts = prisma.orderProducts.createMany({
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

export const getAllOrders = async ({ctx, input}: TRPCRequestOptions<TGetAllOrdersSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let whereCondition : any = {}

        if(input.orderStatus )
            whereCondition = {orderStatus : input.orderStatus};
        if(input.ordersDate )
            whereCondition = { ...whereCondition, createdAt: getDateRangeForQuery(input.ordersDate)};
        if(input.userId)
            whereCondition = { ...whereCondition, userId: input.userId};
        if(input.orderId)
            whereCondition = { ...whereCondition, id: input.orderId};
            
        console.log(whereCondition)
        const take = 30;
        const orders = await prisma.orders.findMany({
            take: input.page && take,
            skip: input.page && ( take * (input.page - 1) ),
            where: whereCondition,
            select: {
                id: true,
                type: true,
                totalAmount: true,
                creditUtilised: true,
                userId: true,
                shipmentId: true,
                deliveryDate: true,
                orderStatus: true,
                productCount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        console.log(orders)
        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message:"", 
            data: orders
        };
    }catch(error) {
        //console.log("\n\n Error in initiateOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}

export const getOrderReturnDetails = async( {ctx, input}: TRPCRequestOptions<TGetUserOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const returnOrder = await prisma.returns.findMany({
            where: {
                orderId: input.orderId
            },
            select: {
                id: true,
                returnStatus: true,
                returnShipmentId: true,
                createdAt: true,
                returnType: true,
                returnItems: {
                    include: {
                        ReplacementItem: {
                            select: {
                                id: true,
                                nonReplaceAction: true,
                                nonReplacableQuantity: true,
                                productVariant: {
                                    select: {
                                        size: true
                                    }
                                }
                            }
                        }
                    }
                },
                creditNote: true,
                ReplacementOrder: {
                    select: {
                        id: true,
                        status: true,
                        shipmentId: true
                    }
                }
            }
        });
        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message:"", 
            data: returnOrder
        };
    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}
    
export const getOrder = async ({ctx, input}: TRPCRequestOptions<TGetOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        console.log(input.orderId)
        const orders = await prisma.orders.findUnique({
            where: {
                id: input.orderId
            },
            select: {
                id: true,
                totalAmount: true,
                productCount: true,
                creditUtilised: true,
                creditNoteId: true,
                deliveryDate: true,
                orderStatus: true,
                createdAt: true,
                returnAcceptanceDate: true,
                _count: {
                    select: {
                        return: true
                    }
                },
                Payments: {
                    include: {
                        RefundTransactions : {
                            include: {
                                CreditNotes: true
                            }
                        }
                    }
                },
                // shipment: true,
                user: { 
                    select : {
                        contactNumber: true
                    }
                },
                address: true,
                orderProducts: {
                    include: {
                        productVariant: {
                            select: {
                                size: true,
                                product: {
                                    select: {
                                        sku: true,
                                        productImages: {
                                            select: {
                                                image: true
                                            }
                                        }   
                                    }
                                }
                            }
                        }
                    }
                },
            }
        })
        console.log(orders)
        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message:"", 
            data: orders
        };
    }catch(error) {
        //console.log("\n\n Error in initiateOrder ----------------");
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

// not so sure about it.
// maybe a route to confirm the payment.
export const editOrder = async ({ctx, input}: TRPCRequestOptions<TEditOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let editOrderQueries = []
        switch(input.status){
            case "ACCEPTED":
                await acceptOrder(input.orderId);
                break;
            case "DELIVERED":
                editOrderQueries.push(prisma.orders.update({where: {id: input.orderId}, data: {orderStatus: "DELIVERED", deliveryDate: Date.now(), returnAcceptanceDate: ( Date.now() + returnExchangeTime ) }}))
                break;
            case "CANCELED": // this is for pending order, coz at pending state the quantities are not deducted
                editOrderQueries.push(prisma.orders.update({where: {id: input.orderId}, data: {orderStatus:"CANCELED"}}));
            default:
                break;
        }

        if(input.productRejectStatus){
            for(let orderProductId of Object.keys(input.productRejectStatus)){
                editOrderQueries.push(
                    prisma.orderProducts.update({
                        where: {
                            id: +orderProductId
                        },
                        data: {
                            rejectedQuantity: input.productRejectStatus[orderProductId]?.rejectedQuantity,
                            // if payment mode is COD then update the imbursed qantity as rejectedQuantity
                            // reimbursedQuantity: input.productStatus[orderProductId]?.rejectedQuantity
                        }
                    })
                )
            }

            prisma.$transaction(editOrderQueries);

        }

        if( !isNaN(Number(input.returnDateExtend)) && input.returnDateExtend && input.initialReturnDate){
            editOrderQueries.push(prisma.orders.update({
                where: {
                    id: input.orderId
                },
                data: {
                    returnAcceptanceDate: input.initialReturnDate + ( input.returnDateExtend * 86400000)
                }
            }))
        }

        prisma.$transaction(editOrderQueries)

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    } catch(error) {
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};