-- CreateEnum
CREATE TYPE "UserCreditTransactionType" AS ENUM ('ADD', 'DEBIT');

-- CreateEnum
CREATE TYPE "ReturnRefundMode" AS ENUM ('CREDIT', 'REFUND');

-- CreateEnum
CREATE TYPE "UserPermissionRoles" AS ENUM ('USER', 'ADMIN', 'ADMIN_APPROVER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "DiscountConditionsTypeForUser" AS ENUM ('USE_ONCE', 'FIRST_ORDER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ALL', 'COD', 'UPI');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING', 'PICKED');

-- CreateEnum
CREATE TYPE "ReturnItemStatus" AS ENUM ('PENDING', 'REJECTED', 'ACCEPTED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'created', 'attempted', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "ReplacementOrderStatus" AS ENUM ('RECEIVED', 'REJECTED', 'INITIATED', 'ACCEPTED', 'PENDING');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('CANCELED', 'CONFIRMED', 'PENDING');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'PAYMENT_FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UserPermissionType" AS ENUM ('API');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('CUSTOMER', 'COMPANY_WAREHOURSE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('NEW', 'REPLACEMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "role" "UserPermissionRoles" NOT NULL,
    "cartId" INTEGER,
    "otp" INTEGER NOT NULL,
    "otpExpire" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCreditTransaction" (
    "id" SERIAL NOT NULL,
    "userCreditId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "orderId" INTEGER,
    "returnId" INTEGER,
    "type" "UserCreditTransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "cartTotal" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'CUSTOMER',
    "contactName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "contactNumber" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discounts" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "type" "DiscountType" NOT NULL,
    "expiry" TEXT NOT NULL,
    "status" "DiscountStatus" NOT NULL DEFAULT 'ACTIVE',
    "useCount" BIGINT DEFAULT 0,
    "discountConditionId" INTEGER,

    CONSTRAINT "Discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDiscounts" (
    "userId" INTEGER NOT NULL,
    "discountId" INTEGER NOT NULL,

    CONSTRAINT "UserDiscounts_pkey" PRIMARY KEY ("userId","discountId")
);

-- CreateTable
CREATE TABLE "DiscountConditions" (
    "id" SERIAL NOT NULL,
    "conditionForUser" "DiscountConditionsTypeForUser",
    "minValue" INTEGER,
    "maxValue" INTEGER,
    "paymentMode" "PaymentType",
    "productCategoryId" INTEGER,

    CONSTRAINT "DiscountConditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategorySizes" (
    "id" SERIAL NOT NULL,
    "sizeChartName" TEXT NOT NULL,
    "sizeChart" JSONB NOT NULL,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategorySizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "priorityIndex" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "tags" TEXT[],
    "categoryId" INTEGER NOT NULL,
    "soldOut" BOOLEAN NOT NULL DEFAULT false,
    "care" TEXT[],
    "details" TEXT[],
    "sku" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariants" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "subSku" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "baseSkuInventoryId" INTEGER,
    "lastRestockDate" TIMESTAMP(3),
    "lastRestockQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baseSkuInventory" (
    "id" SERIAL NOT NULL,
    "baseSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "lastRestockDate" TIMESTAMP(3),
    "lastRestockedQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "baseSkuInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendorOrder" (
    "id" SERIAL NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorAddress" TEXT NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "advPayment" DECIMAL(65,30) NOT NULL,
    "advPaymentMode" TEXT NOT NULL,
    "advPaymentDate" TIMESTAMP(3) NOT NULL,
    "advPaymentTransactionId" TEXT NOT NULL,
    "finalPayment" DECIMAL(65,30),
    "finalPaymentMode" TEXT,
    "finalPaymentDate" TIMESTAMP(3),
    "finalPaymentTransactionId" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "receivingDate" TIMESTAMP(3),
    "orderDetails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendorOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "rzpOrderId" TEXT NOT NULL,
    "rzpPaymentId" TEXT,
    "rzpPaymentSignature" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentService" TEXT NOT NULL DEFAULT 'Razorpay',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "shipmentOrderId" TEXT NOT NULL,
    "shipmentServiceName" TEXT NOT NULL,
    "shipmentTrackingLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" NOT NULL DEFAULT 'NEW',
    "creditUtilised" INTEGER DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "userId" INTEGER NOT NULL,
    "productCount" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,
    "discountId" INTEGER,
    "paymentId" INTEGER,
    "shipmentId" INTEGER,
    "deliveryDate" BIGINT,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderProducts" (
    "id" SERIAL NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "productStatus" "ProductStatus" NOT NULL DEFAULT 'PENDING',
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "returnQuantity" INTEGER,
    "replacementQuantity" INTEGER,
    "orderId" INTEGER NOT NULL,
    "rejectedQuantity" INTEGER DEFAULT 0,

    CONSTRAINT "OrderProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Returns" (
    "id" SERIAL NOT NULL,
    "returnReceiveDate" TIMESTAMP(3),
    "orderId" INTEGER NOT NULL,
    "returnShipmentId" INTEGER,
    "returnStatus" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "refundAmount" DECIMAL(65,30) DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refundMode" "ReturnRefundMode" NOT NULL DEFAULT 'CREDIT',

    CONSTRAINT "Returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" SERIAL NOT NULL,
    "status" "ReturnItemStatus" NOT NULL DEFAULT 'PENDING',
    "returnId" INTEGER NOT NULL,
    "orderProductId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "referenceImage" TEXT NOT NULL,
    "returnReason" TEXT NOT NULL,
    "acceptedQuantity" INTEGER DEFAULT 0,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementReason" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "photoProofRequired" BOOLEAN NOT NULL DEFAULT false,
    "videoProofRequired" BOOLEAN NOT NULL DEFAULT false,
    "userCustomReasonRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReplacementReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementOrder" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "replacementReasonId" INTEGER NOT NULL,
    "status" "ReplacementOrderStatus" NOT NULL DEFAULT 'PENDING',
    "returnOrderId" INTEGER NOT NULL,
    "shipmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplacementOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplacementItem" (
    "id" SERIAL NOT NULL,
    "replacementOrderId" INTEGER NOT NULL,
    "returnItemId" INTEGER NOT NULL,
    "productVariantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplacementItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DiscountsToProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_contactNumber_key" ON "User"("contactNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cartId_key" ON "User"("cartId");

-- CreateIndex
CREATE INDEX "User_contactNumber_idx" ON "User"("contactNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategorySizes_categoryId_key" ON "ProductCategorySizes"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_categoryName_key" ON "ProductCategory"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "Products_name_key" ON "Products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Products_sku_key" ON "Products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariants_subSku_key" ON "ProductVariants"("subSku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariants_productId_size_key" ON "ProductVariants"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productVariantId_key" ON "Inventory"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentOrderId_key" ON "Shipment"("shipmentOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_shipmentId_key" ON "Orders"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProducts_orderId_productVariantId_key" ON "OrderProducts"("orderId", "productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Returns_returnShipmentId_key" ON "Returns"("returnShipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_returnOrderId_key" ON "ReplacementOrder"("returnOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_shipmentId_key" ON "ReplacementOrder"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscountsToProducts_AB_unique" ON "_DiscountsToProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscountsToProducts_B_index" ON "_DiscountsToProducts"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredit" ADD CONSTRAINT "UserCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCreditTransaction" ADD CONSTRAINT "UserCreditTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCreditTransaction" ADD CONSTRAINT "UserCreditTransaction_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCreditTransaction" ADD CONSTRAINT "UserCreditTransaction_userCreditId_fkey" FOREIGN KEY ("userCreditId") REFERENCES "UserCredit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discounts" ADD CONSTRAINT "Discounts_discountConditionId_fkey" FOREIGN KEY ("discountConditionId") REFERENCES "DiscountConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiscounts" ADD CONSTRAINT "UserDiscounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiscounts" ADD CONSTRAINT "UserDiscounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountConditions" ADD CONSTRAINT "DiscountConditions_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategorySizes" ADD CONSTRAINT "ProductCategorySizes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProductVariants" ADD CONSTRAINT "ProductVariants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_baseSkuInventoryId_fkey" FOREIGN KEY ("baseSkuInventoryId") REFERENCES "baseSkuInventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_returnShipmentId_fkey" FOREIGN KEY ("returnShipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_orderProductId_fkey" FOREIGN KEY ("orderProductId") REFERENCES "OrderProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_replacementReasonId_fkey" FOREIGN KEY ("replacementReasonId") REFERENCES "ReplacementReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_returnOrderId_fkey" FOREIGN KEY ("returnOrderId") REFERENCES "Returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementItem" ADD CONSTRAINT "ReplacementItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementItem" ADD CONSTRAINT "ReplacementItem_replacementOrderId_fkey" FOREIGN KEY ("replacementOrderId") REFERENCES "ReplacementOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementItem" ADD CONSTRAINT "ReplacementItem_returnItemId_fkey" FOREIGN KEY ("returnItemId") REFERENCES "ReturnItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountsToProducts" ADD CONSTRAINT "_DiscountsToProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DiscountsToProducts" ADD CONSTRAINT "_DiscountsToProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
