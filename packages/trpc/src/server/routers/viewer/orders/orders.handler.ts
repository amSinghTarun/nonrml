import { generateOrderConfirmationEmail, generateOrderCancellationEmail, generateOrderQuantityUpdateEmail, TRPCResponseStatus, generateShippingNotificationEmail } from "@nonrml/common"
import { acceptOrder, generateOrderId, getDateRangeForQuery, getOrderId, TRPCCustomError, TRPCRequestOptions } from "../helper";
import { TCancelOrderSchema, TEditOrderSchema, TGetAllOrdersSchema, TGetOrderSchema, TGetUserOrderSchema, TInitiateOrderSchema, TTrackOrderSchema, TCheckOrderServicibilitySchema, TVerifyOrderSchema, TGetOrderReturnSchema, TCancelAcceptedOrderSchema, TShipOrderrSchema, TUpdateShipmentSchema} from "./orders.schema";
import { Prisma, prismaEnums, prismaTypes } from "@nonrml/prisma";
import { TRPCError } from "@trpc/server";
import { Orders } from "razorpay/dist/types/orders";
import crypto from 'crypto';
import { createOrder, getOrderDetials, getPaymentDetials, initiateNormalRefund } from "@nonrml/payment";
import { cacheServicesRedisClient } from "@nonrml/cache";
import { ShiprocketShipping } from "@nonrml/shipping"
import { sendSMTPMail } from "@nonrml/mailing";
const returnExchangeTime = 432000000; // 5 days
const WAREHOUSE_PINCODE=495004

export const sendOrderConfMail = async ({ctx, input}: TRPCRequestOptions<{orderId: string}>) => {
    const prisma = ctx.prisma;
    const orderDetails = await prisma.orders.findUnique({
        where: {
            id: getOrderId(input?.orderId!)
        },
        select: {
            id: true,
            createdAt: true,
            idVarChar: true,
            address: true,
            totalAmount: true,
            user: {
                select: {
                    contactNumber: true,
                    email: true
                }
            },
            creditUtilised: true,
            Payments: {
                select: {
                    paymentMethod: true
                }
            },
            orderProducts: {
                select:{
                    quantity: true,
                    productVariant: {
                        select: {
                            size: true,
                            product: {
                                select: {
                                    sku: true,
                                    price: true,
                                    productImages: {
                                        where: {
                                            priorityIndex: {
                                                equals: 0
                                            }
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

    let products = orderDetails?.orderProducts.map((product => ({sku: product.productVariant.product.sku, size: product.productVariant.size, image: product.productVariant.product.productImages[0]!.image, price: product.productVariant.product.price, quantity: product.quantity })))
    
    const emailHTML = generateOrderConfirmationEmail({
        customerName: orderDetails?.address?.contactName!,
        customerNumber: orderDetails?.user?.contactNumber!,
        orderId: `ORD-${orderDetails?.id}${orderDetails?.idVarChar}`,
        orderDate: (new Date(orderDetails?.createdAt!)).toDateString(),
        products: products!,
        credit: orderDetails?.creditUtilised!,
        total: orderDetails?.totalAmount!,
        shippingAddress: {
            name: orderDetails?.address?.contactName!,
            state: orderDetails?.address?.state!,
            street: orderDetails?.address?.location!,
            city: orderDetails?.address?.city!,
            country: "INDIA",
            zip: orderDetails?.address?.pincode!
        },
        paymentMethod: orderDetails?.Payments?.paymentMethod!,
    });
    
    // let creditNoteMailData = {
    //     creditNoteId: "CN-bfew8ccsdkjbc",
    //     originalOrderNumber: "ORD-324hbc3c",
    //     creditAmount: 2900,
    //     customerMobile: "+916265176187",
    //     creditNoteExpiry: "2025-05-17 06:30:59.083"
    // }
    // const creditNoteMail = generateCreditNoteEmail(creditNoteMailData)

    if(orderDetails?.user?.email)
        await sendSMTPMail({userEmail: orderDetails?.user?.email, emailBody: emailHTML})
}

/*
Get all the orders of a user
No pagination required for now, as the result quantity is gonna stay small
*/
export const getUserOrders = async ({ ctx } : TRPCRequestOptions<null>) => {
    const prisma = ctx.prisma;
    const userId = ctx.user?.id;

    try{
        const orders = await prisma.orders.findMany({
            where: {
                userId: userId
            },
            select:{
                id: true,
                orderStatus: true,
                idVarChar: true,
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
                    }
                }
            },
            orderBy: [{
                "createdAt" : "desc"
            }]
        });

        return {status: TRPCResponseStatus.SUCCESS, message: "", data: { orders, userContact: ctx.user?.contactNumber }};

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
                id: Number(input.orderId),
                orderStatus: "PENDING",
                Payments:{
                    paymentStatus: {
                        // so that prepaid order that aren't accepted shouldn't get cancelled
                        notIn: ["authorized", "captured"]
                    }
                }
            },
            data: {
                orderStatus: prismaEnums.OrderStatus.CANCELED
            }
        });

        console.log(cancelledOrder);

        return {status: TRPCResponseStatus.SUCCESS, message: "", data: cancelledOrder};

    } catch(error){
        // console.log("\n\n Error in getUserOrders ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error) 
    }
};

export const updateShipmentStatus = async ({ ctx, input } : TRPCRequestOptions<TUpdateShipmentSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        // import from the shipping package

        // const cancelledOrder = await prisma.orders.update({
        //     where: {
        //         id: Number(input.orderId),
        //         orderStatus: "PENDING",
        //         Payments:{
        //             paymentStatus: {
        //                 // so that prepaid order that aren't accepted shouldn't get cancelled
        //                 notIn: ["authorized", "captured"]
        //             }
        //         }
        //     },
        //     data: {
        //         orderStatus: prismaEnums.OrderStatus.CANCELED
        //     }
        // });

        // console.log(cancelledOrder);

        return {status: TRPCResponseStatus.SUCCESS, message: "", data: "updateShipmentStatus"};

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
export const getUserOrder = async ({ctx, input}: TRPCRequestOptions<TGetUserOrderSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let orderId = getOrderId(input.orderId);
        let idVarChar = input.orderId.slice(-6);

        let orderDetails = await prisma.orders.findUnique({
            where: {
                id: orderId,
                idVarChar: idVarChar
            },
            include: {
                address: true,
                creditNote: {
                    select: {
                        creditCode: true
                    }
                },
                shipment: {
                    select: {
                        shipmentOrderId: true
                    }
                },
                Payments:{
                    select:{
                        paymentStatus: true,
                        rzpOrderId: true,
                        rzpPaymentId: true
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

        // it's almost impossible that a user will stumble upon this without going through address phase
        // the first time it will run, it will save whatever razorpay has so address user whatever we have will
        // not run again, so check for both can be used
        if( !orderDetails.userId && !orderDetails.addressId && orderDetails.Payments ){
            
            const rzpOrderData = await getOrderDetials({rzpOrderId: orderDetails.Payments.rzpOrderId});

            if(rzpOrderData && rzpOrderData.customer_details && rzpOrderData.customer_details.contact){
                let contactNumber = `${rzpOrderData.customer_details.contact}`
                let addressDetails = {
                    contactName: rzpOrderData.customer_details.shipping_address.name || rzpOrderData.customer_details.name,
                    contactNumber: rzpOrderData.customer_details.shipping_address.contact || contactNumber,
                    location: rzpOrderData.customer_details.shipping_address.line1?.trim() + ", " + rzpOrderData.customer_details.shipping_address.line2?.trim(),
                    city: rzpOrderData.customer_details.shipping_address.city ?? 0,
                    state: rzpOrderData.customer_details.shipping_address.state ?? 0,
                    pincode: rzpOrderData.customer_details.shipping_address.zipcode ?? 0
                }

                let addressId = null;
                let user : {id: number} | null = orderDetails.userId ? {id: orderDetails.userId} : null

                if(!user){
                    user = await prisma.user.findUnique({
                        where: {
                            contactNumber: contactNumber
                        },
                        select: {
                            id: true
                        }
                    })
    
                    if(!user){
                        user = await prisma.user.create({
                            data:{
                                contactNumber: contactNumber,
                                email: rzpOrderData.customer_details.email ?? "",
                                role: prismaEnums.UserPermissionRoles.USER
                            }
                        });            
                    }
                }


                if(addressDetails.pincode && addressDetails.city && addressDetails.state){
                    let address = await prisma.address.findFirst({
                        where: {
                            userId: user.id,
                            location: addressDetails.location,
                            pincode: addressDetails.pincode.toString()
                        }
                    });
                    if(!address){
                        address = await prisma.address.create({
                            data: {
                                userId: user.id,
                                ...addressDetails,
                                pincode: addressDetails.pincode.toString(),
                                city: addressDetails.city.toString(),
                                state: addressDetails.state.toString()
                            }
                        })
                    }
                    addressId = address.id;
                    orderDetails.address = address
                }

                const updateData = {
                    ...( !orderDetails.userId && {userId: user.id}),
                    ...( addressId && {addressId: addressId} )
                }

                if(updateData.addressId || updateData.userId)
                    await prisma.orders.update({
                        where: {
                            id: orderDetails.id
                        },
                        data: updateData
                    })

                if(orderDetails.Payments.paymentStatus == "captured" && orderDetails.orderStatus !== "ACCEPTED") {
                    await acceptOrder(orderDetails.id);
                }
            }
        }

        let bankRefunds = 0;
        if(orderDetails.Payments?.rzpPaymentId){
            const bankRefunds = await prisma.refundTransactions.count({
                where: {
                    rzpPaymentId: orderDetails.Payments?.rzpPaymentId,
                    bankRefundValue: {
                        gte: 1
                    }
                }
            });
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: {orderDetails, bankRefunds }};
    } catch(error) {
        //console.log("\n\n Error in getUserOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

export const getTrackOrder = async ({ctx, input}: TRPCRequestOptions<TTrackOrderSchema>)  => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        let orderId = getOrderId(input.orderId);
        const orderDetails = await prisma.orders.findUniqueOrThrow({
            where: {
                id: orderId,
            },
            include: {
                user: true,
                shipment: true 
            }
        });

        console.log(orderDetails, "/n/n/n/n/n/", input)

        if( orderDetails.user && orderDetails.user.contactNumber !== `+91${input.mobile}`  )
            throw new TRPCError({code:"NOT_FOUND", message: "Check Order Details Thoroughly"})

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

    * update the payment status
    * update the credit note
    * put order in pending state if cod 
    queries in db transactions
    accept the order if prepaid
        update the sku quantity
        update the order status
*/ 
export const verifyOrder = async ({ctx, input}: TRPCRequestOptions<TVerifyOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    // const userId = ctx.user?.id!;
    try{

        console.log(input)
        
        const orderDetails = await prisma.payments.findUnique({
            where: {
                rzpOrderId: input.razorpayOrderId,
                // Orders: { userId: userId }
            },
            include: {
                Orders: {
                    include: {
                        creditNote: true,
                    }
                }
            }
        })

        if(!orderDetails || !orderDetails.Orders || !orderDetails.orderId)
            throw new TRPCError({code: "BAD_REQUEST", message: "Order not found"});

        console.log(process.env.RAZORPAY_KEY_SECRET);

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(orderDetails.rzpOrderId + "|" + input.razorpayPaymentId)
            .digest('hex');
        if (generated_signature != input.razorpaySignature) 
            throw new TRPCError({code: "BAD_REQUEST", message: "Payment signature verification failed"});

        const rzpPaymentData = await getPaymentDetials({rzpPaymentId: input.razorpayPaymentId});
        // const rzpOrderData = await getOrderDetials({rzpOrderId: rzpPaymentData.order_id});

        // let contactNumber = `${rzpPaymentData.contact}`;
        // let addressId = 0;
        
        // let user = await prisma.user.findUnique({
        //     where: {
        //         contactNumber: contactNumber
        //     },
        //     select: {
        //         id: true
        //     }
        // })

        // if(!user){
        //     user = await prisma.user.create({
        //         data:{
        //             contactNumber: contactNumber,
        //             email: rzpPaymentData.email,
        //             role: prismaEnums.UserPermissionRoles.USER
        //         }
        //     });            
        // }

        // if(rzpOrderData.customer_details){
        //     const location = rzpOrderData.customer_details?.shipping_address.line1?.trim() + ", " + rzpOrderData.customer_details?.shipping_address.line2?.trim();
        //     let address = await prisma.address.findFirst({
        //         where: {
        //             userId: user.id,
        //             location: location
        //         }
        //     });
        //     if(!address){
        //         address = await prisma.address.create({
        //             data: {
        //                 userId: user.id,
        //                 location: location,
        //                 contactName: rzpOrderData.customer_details?.shipping_address.name || "",
        //                 contactNumber: rzpOrderData.customer_details?.shipping_address.contact || "",
        //                 city: rzpOrderData.customer_details?.shipping_address.city || "",
        //                 state: rzpOrderData.customer_details?.shipping_address.state || "",
        //                 pincode: `${rzpOrderData.customer_details?.shipping_address.zipcode}` || "",
        //             }
        //         })
        //     }
        //     addressId = address.id;
        // }

        await prisma.$transaction( async prisma => {
            await prisma.orders.update({
                where: {
                    id: orderDetails.orderId
                },
                data: {
                    // userId: user.id,
                    // ...( addressId && { addressId: addressId} ),
                    Payments: {
                        update: {
                            paymentStatus: rzpPaymentData.status,
                            rzpPaymentId: input.razorpayPaymentId,
                            rzpPaymentSignature: input.razorpaySignature,
                            paymentMethod: rzpPaymentData.method
                        }
                    }
                }
            });
    
            //console.log(Number(orderDetails.totalAmount) < orderDetails.creditUtilised!);
            orderDetails.Orders.creditNote && (
                await prisma.creditNotesPartialUseTransactions.create({
                    data : {
                        creditNoteId: orderDetails.Orders.creditNote.id,
                        orderId: orderDetails.Orders.id,
                        valueUtilised: orderDetails.Orders.creditUtilised!
                    }
                }) ,
                await prisma.creditNotes.update({
                    where:{
                        id: orderDetails.Orders.creditNote.id
                    },
                    data : {
                        remainingValue: orderDetails.Orders.creditNote.remainingValue - orderDetails.Orders.creditUtilised!
                    }
                })
            )
        }, { timeout: 10000 });

        // if(rzpPaymentData.captured) {
        //     await acceptOrder(orderDetails.Orders.id);
        // }

        return {status: TRPCResponseStatus.SUCCESS, message: "Payment verified", data: {orderId: `ORD-${orderDetails.orderId}${orderDetails.Orders.idVarChar}`}};
    }catch(error){  
        //console.log("\n\n Error in verifyOrder ----------------");
        // if(error.message == "ERROR_ACCEPTING_ORDER"){
            // throw some error and catch it in frontend to not show any toast but to redirect to the account page and 
            // let admin do the accepting or whatever.
        // }
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
    The shipment is created from the change status function

    $transaction can cross time constraint

*/
export const initiateOrder = async ({ctx, input}: TRPCRequestOptions<TInitiateOrderSchema>) => {
    input = input!;
    const userId = ctx.user?.id;
    const prisma = ctx.prisma;
    try{
        let cnUseableValue = 0;
        let creditNoteId = null;
        let orderTotal = 0;
        if(input.creditNoteCode && userId){
            const creditNote = await prisma.creditNotes.findFirst({
                where: {
                    creditCode: input.creditNoteCode,
                }
            });
            if(!creditNote)
                throw new TRPCError({code:"NOT_FOUND", message: "No Credit note found for the given code"});
            
            creditNoteId = creditNote.id
            cnUseableValue = creditNote.remainingValue;
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
                        id: true,
                        name: true,
                        sku: true
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
        
        let line_items : Orders.LineItems[] = []

        for (const variant of productValidation) {
            const orderProduct = input.orderProducts[variant.id];
            // console.log(variant.inventory!, variant.inventory!.baseSkuInventory?.quantity, orderProduct!.quantity)
            if ( (variant.inventory!.quantity + (variant.inventory!.baseSkuInventory?.quantity || 0)) < orderProduct!.quantity ) {
                await cacheServicesRedisClient().del(`productVariantQuantity_${variant.product.id}`)
                insufficientProductQuantities = {...insufficientProductQuantities, [variant.id] : { ...input.orderProducts[variant.id], quantity: 0}};
            }
            if (variant.product.price !== orderProduct!.price) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Price mismatch for ${variant.product.name}`
                });
            }
            orderTotal += (variant.product.price * orderProduct!.quantity);
            line_items.push({
                sku: variant.product.sku,
                name: variant.product.name,
                price: `${variant.product.price*100}`,
                quantity: orderProduct!.quantity,
                offer_price: `${variant.product.price*100}`,
                variant_id: variant.product.sku,
                description: variant.product.name,
                tax_amount: 0,
                weight: '1',
                type: "e-commerce",
                image_url: "",
                product_url: "",
                dimensions: {
                    length: "1",
                    width: "1",
                    height: "1",
                }
            })
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

        const orderIdChar = generateOrderId();
        const orderPaidAmount = (orderTotal <= cnUseableValue) ? 1 : (orderTotal - cnUseableValue)

        const rzpPaymentCreated = await createOrder({
            amount: orderPaidAmount*100,
            partial_payment: true,
            line_items_total: orderPaidAmount*100, 
            receipt: `${Date.now()}`,
            currency: "INR",
            line_items: line_items
        });

        
        const orderCreated = await prisma.$transaction(async (prisma) => {

            const order = await prisma.orders.create({
                data: {
                    idVarChar: orderIdChar,
                    totalAmount: orderTotal,
                    creditNoteId: creditNoteId,
                    processingRefundAmount: (orderTotal <= cnUseableValue) ? 1 : 0 ,
                    orderStatus: prismaEnums.OrderStatus.PENDING,
                    creditUtilised: orderTotal <= cnUseableValue ? orderTotal : cnUseableValue,
                    productCount: Object.values(input.orderProducts).length,
                    Payments: {
                        create: {
                            rzpOrderId: rzpPaymentCreated.id,
                            paymentStatus: rzpPaymentCreated.status as prismaTypes.PaymentStatus,
                        }
                    }
                },
                select:{
                    id: true
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
        },  {timeout: 10000});

        // console.log(input, orderCreated.orderProducts)

        return { 
            status: TRPCResponseStatus.SUCCESS, 
            message:"", 
            data: {
                orderId: orderCreated.order.id,
                amount: +orderPaidAmount*100, 
                rzpOrderId: rzpPaymentCreated.id, 
                // contact: ctx.user?.contactNumber!, 
                // name: rzpPaymentCreated.data.address.contactName, 
                // email: rzpPaymentCreated.data.address.email
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
        let whereCondition : any = {
            ...( input.orderStatus && { orderStatus : input.orderStatus }),
            ...( input.ordersDate && { createdAt: getDateRangeForQuery(input.ordersDate) }),
            ...( input.userId && { userId: input.userId} ),
            ...( input.orderId && { id: input.orderId} ),
            // ...( input.returns && { })
        }

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
                _count: {
                    select: {
                        return: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

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

export const getOrderReturnDetails = async( {ctx, input}: TRPCRequestOptions<TGetOrderReturnSchema>) => {
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
                idVarChar: true,
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
                            select: {
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
                editOrderQueries.push(prisma.orders.update({where: {id: input.orderId, orderStatus: "PENDING"}, data: {orderStatus:"CANCELED"}}));
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

            const remainingProductStatus = await prisma.orderProducts.aggregate({
                where: {
                    orderId: input.orderId
                },
                _sum: {
                    quantity: true,
                    rejectedQuantity: true
                }
            });

            const effectiveRemainingQuantity = (remainingProductStatus._sum.quantity ?? 0) - (remainingProductStatus._sum.rejectedQuantity ?? 0)

            if(effectiveRemainingQuantity == 0){
                editOrderQueries.push(prisma.orders.update({
                    where: {
                        id: input.orderId
                    },
                    data: {
                        orderStatus:prismaEnums.OrderStatus.CANCELED_ADMIN,
                        // // i guess it shouldn't be here and should only be updated by the initite unavailtity refind
                        // Payments: {
                        //     update: {
                        //         paymentStatus: "refunded"
                        //     }
                        // }
                    },
                    select: {
                        id: true,
                        idVarChar: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }))
            };

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

        editOrderQueries.length && await prisma.$transaction(editOrderQueries)

        if(input.productRejectStatus){
            const orderDetails = await prisma.orders.findUnique({
                where: {
                    id: input.orderId
                },
                select: {
                    id: true,
                    idVarChar: true,
                    orderStatus: true,
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            });
            if(!orderDetails || !orderDetails.user?.email){
                return { status: TRPCResponseStatus.SUCCESS, message:"", data: "User doesn't have an email address linked to the account"};
            } else{
                if(orderDetails.orderStatus == "CANCELED_ADMIN"){
                    await sendSMTPMail({
                        userEmail: orderDetails.user.email, 
                        emailBody: generateOrderCancellationEmail(`${orderDetails.id}`, orderDetails.idVarChar, "UNAVAILABILITY")
                    })
                } else {
                    await sendSMTPMail({
                        userEmail: orderDetails.user.email, 
                        emailBody: generateOrderQuantityUpdateEmail(`${orderDetails.id}`, orderDetails.idVarChar)
                    });
                }
            }
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    } catch(error) {
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
};

export const checkOrderServicibility = async ({ctx, input}: TRPCRequestOptions<TCheckOrderServicibilitySchema>) => {
    const prisma = ctx.prisma;
    input = input!
    try{
        // await prisma.orders.findFirstOrThrow({
        //     where: {
        //         Payments: {
        //             rzpOrderId:  `order_${input.rzpOrderId}`
        //         }
        //     },
        //     select: {
        //         id: true,
        //     }
        // });

        let shippingAddressesDetails = []

        for( let address of input.addresses ){
            let deliveryDetails = await ShiprocketShipping.ShiprocketShipping.checkServiceability({pickupPostcode: WAREHOUSE_PINCODE, deliveryPostcode: Number(address.zipcode)});
            shippingAddressesDetails.push({
                id: address.id,
                zipcode: address.zipcode,
                state_code: address.state_code,
                country: address.country,
                "serviceable": deliveryDetails.serviceable,
                "cod": deliveryDetails.cod, 
                "cod_fee": deliveryDetails.cod_fee,
                "shipping_fee": deliveryDetails.shipping_fee,
                shipping_methods: [deliveryDetails]
            });
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: shippingAddressesDetails};

    }catch(error){
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}

export const shipOrder = async ({ctx, input}: TRPCRequestOptions<TShipOrderrSchema>) => {
    const prisma = ctx.prisma;
    input = input!
    try{

        const orderDetails = await prisma.orders.findFirstOrThrow({
            where: {
                id: input.orderId,
                orderStatus: "ACCEPTED"
            },
            include: {
                Payments: true,
                user: true,
            }
        });

        if(orderDetails.processingRefundAmount == 1 && orderDetails.Payments?.rzpPaymentId){
            const refunded = await initiateNormalRefund( orderDetails.Payments.rzpPaymentId, { amount: orderDetails.processingRefundAmount, speed: "normal"} )
            if(refunded.status == "processed"){
                await prisma.orders.update({
                    where: {id: orderDetails.id},
                    data: {
                        processingRefundAmount: -1
                    }
                });
            }
        }

        // what happens here is still pending

        // store tracking id in the shipment table

        // send the product shipped mail with tracking details tracking mail and has info  of processingRefundAmount
        if(orderDetails.user?.email){
            await sendSMTPMail({
                userEmail: orderDetails.user.email, 
                emailBody: generateShippingNotificationEmail({  
                    orderId: `ORD-${orderDetails.id}${orderDetails.idVarChar}`,
                    refundAmount: orderDetails.processingRefundAmount > 0 ? orderDetails.processingRefundAmount : 0 ,
                    
                    
                    
                    
                    
                    waybillNumber: "waybillNumber",




                    trackingLink: "https://www.delhivery.com/tracking"
                })
            })
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"", data: ""};

    }catch(error){
        //console.log("\n\n Error in editOrder ----------------");
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error)
    }
}

/**
 * Cancel an accepted order
 * Mode of refund can be Credit note or money, as required
 * Steps:
 *  Admin has to update the product quantity back in the inventory manually depending it's printed or not
 *  Refund
 *      Credit note.
 *      OR
 *      Bank refund.
 *  Status cancel to cancel
*/
export const cancelAcceptedOrder = async ({ctx, input} : TRPCRequestOptions<TCancelAcceptedOrderSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{
        const orderDetails = await prisma.orders.findUniqueOrThrow({
            where: {
                id : input?.orderId
            },
            include: {
                Payments: {
                    select: {
                        paymentMethod: true,
                        rzpPaymentId: true,
                        paymentStatus: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        contactNumber: true,
                        email: true
                    }
                }
            }
        });

        if( !orderDetails.Payments || !orderDetails.user )
            throw { code: "BAD_REQUEST", message: "Order missing Payment OR user details"}

        if(orderDetails.Payments?.paymentMethod == "cod"){
            if(orderDetails.creditNoteId && orderDetails.creditUtilised){
                await prisma.creditNotes.update({
                    where: {
                        id: orderDetails.creditNoteId
                    },
                    data: {
                        remainingValue: {
                            increment: orderDetails.creditUtilised
                        }
                    }
                })
            }
            await prisma.orders.update({
                where: {
                    id: orderDetails.id
                },
                data: {
                    orderStatus: "CANCELED"
                }
            })
            return { status: TRPCResponseStatus.SUCCESS, message:"COD order cancelled", data: {}};
        }

        if(!orderDetails.Payments.rzpPaymentId || orderDetails.Payments.paymentStatus != "captured")
            throw { code: "BAD_REQUEST", message: "Payment hasn't been received yet"};

        let cancelQueries = [];
        let creditNoteRefund = orderDetails.creditUtilised ?? 0;
        let bankRefund = orderDetails.totalAmount - creditNoteRefund;

        if(input.refundMode == "CREDIT"){
            // if the refund is credit then the whole amount just get refunded as credit note
            cancelQueries.push(
                prisma.creditNotes.create({
                    data: {
                        value: orderDetails.totalAmount,
                        remainingValue: orderDetails.totalAmount,
                        email: orderDetails.user.email!,
                        creditNoteOrigin: prismaEnums.CreditNotePurpose.ORDER,
                        userId: orderDetails.user.id,
                        orderId: input.orderId,
                        expiryDate: new Date( new Date().setMonth( new Date().getMonth() + Number(process.env.CREDIT_NOTE_EXPIRY) ) ),
                        creditCode: `GIFT-${orderDetails.user.id}${crypto.randomBytes(1).toString('hex').toUpperCase()}${(new Date()).toISOString().split('T')[0]!.replaceAll('-', "").slice(2)}`
                    }
                })
            ) 
        } else if( input.refundMode ==  "BANK") {
            // if the refund is bank then the split that came from the bank goes to bank and the split that came from credit note goes to back to the prev credit note
            if( orderDetails.creditNoteId && creditNoteRefund){
                cancelQueries.push(
                    prisma.creditNotes.update({
                        where: {
                            id: orderDetails.creditNoteId
                        },
                        data: {
                            remainingValue: {
                                increment: creditNoteRefund
                            }
                        }
                    })
                )
            }
            const refunded = await initiateNormalRefund( orderDetails.Payments.rzpPaymentId, { amount: bankRefund, speed: "normal"} )
            cancelQueries.push(
                prisma.refundTransactions.create({
                    data: {
                        rzpRefundId: refunded.id,
                        rzpPaymentId: refunded.payment_id,
                        bankRefundValue: refunded.amount,
                        rzpRefundStatus: refunded.status
                    }
                })
            )
        }

        cancelQueries.push(
            prisma.orders.update({
                where: {
                    id: orderDetails.id
                },
                data: {
                    orderStatus: "CANCELED",
                    Payments:{
                        update:{
                            paymentStatus: "refunded"
                        }
                    }
                }
            })
        );

        await prisma.$transaction(cancelQueries)
        
        //send accepted order cancel confirmation mail
        if(orderDetails.user.email)
            await sendSMTPMail({
                userEmail: orderDetails.user.email,
                emailBody: generateOrderCancellationEmail(`${orderDetails.id}`, orderDetails.idVarChar, "ACCEPTED_ORDER")
            })

        return { status: TRPCResponseStatus.SUCCESS, message:"Order cancelled", data: {}};

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error) 
    }
};

/**
    * Update Shipment Status
*/
export const updateShipment = async ({ctx, input} : TRPCRequestOptions<TUpdateShipmentSchema>) => {
    const prisma = ctx.prisma;
    input = input!;
    try{

        const delhiveryStatusToNoNRMLOrderStatusMap = {
            "In Transit": prismaEnums.OrderStatus.SHIPPED,
            "Dispatched": prismaEnums.OrderStatus.IN_TRANSIT,
            "Delivered": prismaEnums.OrderStatus.DELIVERED
        }

        if(input.shipmentStatus in delhiveryStatusToNoNRMLOrderStatusMap){
            const orderDetails = await prisma.shipment.update({
                where: {
                    AWB: input.shipmentId
                },
                data: {
                    order: {
                        update: {
                            orderStatus: delhiveryStatusToNoNRMLOrderStatusMap[input.shipmentStatus as keyof typeof delhiveryStatusToNoNRMLOrderStatusMap]
                        }
                    }
                }
            });    
        }

        return { status: TRPCResponseStatus.SUCCESS, message:"Order Status Updated", data: `Non updateable status received: ${input.shipmentStatus}`};

    } catch(error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) 
            error = { code:"BAD_REQUEST", message: error.code === "P2025"? "Requested record does not exist" : error.message, cause: error.meta?.cause };
        throw TRPCCustomError(error) 
    }
};