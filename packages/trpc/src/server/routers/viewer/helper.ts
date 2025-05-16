import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { prismaEnums, prismaTypes } from "@nonrml/prisma";
import { TRPCContext } from "../../contexts";
import { cacheServicesRedisClient } from "@nonrml/cache";
import { prisma } from "@nonrml/prisma";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/rpc";
import crypto from 'crypto';

export const SALT_SIZE = 8;

export type TRPCRequestOptions<T> = {
    ctx: TRPCContext,
    input?: T
}

export const getOrderId = (orderId: string) : number => {
    if(orderId.search("ORD-") > 0){
        return +orderId.split("-")[1]!.slice(0, -4);
    } else {
        throw new Error("Invalid order id");
    }
}

export const createOTP = (len: number) : number => Number(Math.floor(100000 + Math.random() * 899999))

export const createPasswordHash = async (password: string): Promise<string> => {
    try {
        const hash  = await bcrypt.hash(password, SALT_SIZE);
        return hash;
    } catch (error) {
        throw new Error("Error creating password hash");
    }
}

export const verifyPassword = async (password: string, passwordHash: string) : Promise<Boolean> => {
    try {
        const passwordMatch = await bcrypt.compare(password, passwordHash);
        return passwordMatch;
    } catch(error) {
        throw new Error("Error verifying password");
    }
}

export const getDateRangeForQuery = (date: Date) => {
    // Convert to UTC by adjusting the timezone offset
    const offsetMillis = date.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMillis);
    
    // Format as YYYY-MM-DD
    const isoDateString = localDate.toISOString().split("T")[0];

    // Start of the day (00:00:00.000Z)
    const gte = new Date(`${isoDateString}T00:00:00.000Z`);

    // End of the day (23:59:59.999Z)
    const lte = new Date(`${isoDateString}T23:59:59.999Z`);

    return { gte, lte };
}


export const jsonArrayFieldsToStringArray = (jsonArray: {[key: string]: any}[], fieldName: string) : string[] => {
    let stringOfField : string[] = [];
    for(let x of jsonArray){
        if(fieldName in x){
            stringOfField = [...stringOfField, x[fieldName]!]
        }
    }
    return stringOfField;
}

export const calculateDiscountedValue = (discountValue: number, discountType : prismaTypes.DiscountType, price: number) : number => {
    let discountAmount = discountValue;
    if(discountType == prismaEnums.DiscountType.PERCENTAGE)
        discountAmount = (price*discountValue)/100;
    return price - discountAmount;
}

export const convertTRPCErrorCodeToStatusCode = (statusCode: TRPC_ERROR_CODE_KEY) => {
    const errorStatusToTRPCErrorCodeMap : { [ x: string ] : number } = {
       "BAD_REQUEST" : 400,
       "INTERNAL_SERVER_ERROR" : 500,
       "NOT_IMPLEMENTED" : 501,
       "UNAUTHORIZED" : 401,
       "FORBIDDEN" : 403,
       "NOT_FOUND" : 404,
       "METHOD_NOT_SUPPORTED" : 405,
       "TIMEOUT" : 408,
       "CONFLICT" : 409,
       "PRECONDITION_FAILED" : 412,
       "PAYLOAD_TOO_LARGE" : 413,
       "UNPROCESSABLE_CONTENT" : 422,
       "TOO_MANY_REQUESTS" : 429,
       "CLIENT_CLOSED_REQUEST" : 499
    };
    if(!(statusCode in errorStatusToTRPCErrorCodeMap))
        statusCode = "INTERNAL_SERVER_ERROR";
    return errorStatusToTRPCErrorCodeMap[statusCode]!;
}

export const generateOrderId = () : string => {
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${randomPart}`;
}

export const getSizeOrderIndex = (size: string) => {
    // Define standard size order
    const standardSizes = ["XS", "S", "M", "L", "XL", "XXL"];
    const index = standardSizes.indexOf(size);
    
    if (index !== -1) {
      // If it's a standard size, return its index (gives priority to standard sizes)
      return index;
    }
    
    // For numeric sizes (like 30, 32, etc.)
    const numericSize = parseInt(size);
    if (!isNaN(numericSize)) {
      // Return a value that ensures numeric sizes come after standard sizes
      // Adding 1000 ensures numeric sizes come after standard letter sizes
      return 1000 + numericSize;
    }
    
    // For any other format, return a high value to push it to the end
    // and then rely on alphabetical sorting in the actual sort function
    return 2000;
};

export const TRPCCustomError = (error: any) => {
    console.log(process.env.DATABASE_URL)
    console.log("\n\n\n ------------------ \n ", error, "\n -----------------------------------------------")
    const errorCode = error.code as TRPC_ERROR_CODE_KEY ?? "INTERNAL_SERVER_ERROR";
    const finalError = new TRPCError({
        message: errorCode !== "INTERNAL_SERVER_ERROR" ? error.message : "Having some issue rn, Try after sometime",
        code: errorCode
    });
    throw finalError;
}

export const acceptOrder = async (orderId: number) => {
    try{

        let products : { [id: number]: number } = {};
        const redisOperations: Promise<any>[] = []

        const orderedProducts = await prisma.orderProducts.findMany({
            where:{
                orderId: orderId
            }, 
            select: {
                productVariant: {
                    select: {
                        id: true,
                        product: {
                            select: {
                                id: true,
                                sku: true
                            }
                        }
                    }
                },
                quantity: true
            }
        });
        
        for(let orderProduct of orderedProducts) {
            !products[orderProduct.productVariant.product.id]  && (
                redisOperations.push(
                    cacheServicesRedisClient().del(`productVariantQuantity_${orderProduct.productVariant.product.id}`)
                ),
                products[orderProduct.productVariant.product.id] = 1
            )

            const inventory = await prisma.inventory.findUnique({
                where: {
                    productVariantId: orderProduct.productVariant.id
                },
                select: {
                    id: true,
                    productVariantId: true,
                    quantity: true,
                    baseSkuInventory: {
                        select: {
                            id: true,
                            quantity: true
                        }
                    }
                }
            })

            if(!inventory)
                throw {code: "BAD_REQUEST", message: "Wrong product in order"}

            const orderQuantity = orderProduct.quantity || 0
            const totalAvailable = inventory.quantity + (inventory.baseSkuInventory?.quantity || 0)
            
            const cancelQuantity = Math.max(0, orderQuantity - totalAvailable)
            let newInventoryQuantity = inventory.quantity
            let newBaseQuantity = inventory.baseSkuInventory?.quantity

            if (cancelQuantity <= 0) {
                if (orderQuantity <= inventory.quantity) {
                    newInventoryQuantity = inventory.quantity - orderQuantity
                } else {
                    const remainingForBase = orderQuantity - inventory.quantity
                    newInventoryQuantity = 0
                    newBaseQuantity = inventory.baseSkuInventory 
                        ? inventory.baseSkuInventory.quantity - remainingForBase 
                        : undefined
                }
            };

            const { success } = await prisma.$transaction(async (prismaClient) => {
        
                // Get all inventory details in one query
                console.log("IN PROCESS TO ACCEPT")
                await prismaClient.inventory.update({
                    where: { id: inventory.id },
                    data: {
                        quantity: newInventoryQuantity,
                        ...(newBaseQuantity !== undefined && {
                            baseSkuInventory: {
                                update: { quantity: newBaseQuantity }
                            }
                        })
                    }
                });

                if (cancelQuantity > 0) {
                    await prismaClient.orderProducts.update({
                        where: {
                            orderId_productVariantId: {
                                orderId: orderId,
                                productVariantId: inventory.productVariantId
                            }
                        },
                        data: {
                            rejectedQuantity: cancelQuantity
                        }
                    })
                }
                return { success: true }
            }, {timeout: 10000});

            success && redisOperations.length && await Promise.all(redisOperations);
        }

        await prisma.orders.update({
            where: {
                id: orderId
            },
            data: {
                orderStatus: "ACCEPTED"
            }
        });

        
        if(!orderedProducts.length) throw {code: "BAD_REQUEST", message: "Order with 0 itemds not allowed"}

        return {orderedProducts}
    } catch(error) {
        console.log(error)
        throw new Error("ERROR_ACCEPTING_ORDER");
    }
};

export const calculateRejectedQuantityRefundAmounts = async  (orderId: number, getUpdateQueries?: boolean) => {

    let updateOrderProductReimbursedQueries = [];

    let orderDetails = await prisma.orders.findUnique({
        where: {
            id: orderId
        },
        include : {
            orderProducts: true
        }
    });

    if(!orderDetails)
        throw ({code: "BAD_REQUEST", message: "The order id is invalid"});

    let rejectedQuantityTotal = 0;

    for(let orderProduct of orderDetails.orderProducts){
        if(orderProduct.rejectedQuantity && (orderProduct.rejectedQuantity > orderProduct.reimbursedQuantity)){

            rejectedQuantityTotal += ( orderProduct.rejectedQuantity - orderProduct.reimbursedQuantity ) * Number( orderProduct.price )

            if(getUpdateQueries){
                updateOrderProductReimbursedQueries.push(prisma.orderProducts.update({
                    where: {
                        id: orderProduct.id
                    },
                    data: {
                        reimbursedQuantity: orderProduct.rejectedQuantity
                    }
                }))
            }

        }
    }

    let orderOldTotal = Number(orderDetails.totalAmount);
    let creditUsed = orderDetails.creditUtilised ?? 0;
    let paid = orderOldTotal - creditUsed;
    let newOrderTotal = orderOldTotal - rejectedQuantityTotal;

    let refundToBank = 0;
    let refundToCredit = 0;

    if( newOrderTotal > creditUsed ){
        refundToBank = paid - newOrderTotal + creditUsed
        refundToCredit = 0
    }else if( newOrderTotal < creditUsed){
        refundToBank = paid
        refundToCredit = creditUsed - newOrderTotal
    } else if( creditUsed == newOrderTotal){
        refundToBank = paid
        refundToCredit = 0
    }
    
    return {
        refundToBank,
        refundToCredit,
        userId: orderDetails.userId,
        creditNoteId: orderDetails.creditNoteId,
        updateOrderProductReimbursedQueries
    }
}