/*
  Warnings:

  - You are about to drop the column `name` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "DiscountConditionsTypeForUser" AS ENUM ('USE_ONCE', 'FIRST_ORDER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ALL', 'COD', 'UPI');

-- CreateEnum
CREATE TYPE "UserAccountStatus" AS ENUM ('ACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "UserPermissionType" AS ENUM ('API');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('CUSTOMER', 'COMPANY_WAREHOURSE');

-- CreateEnum
CREATE TYPE "DiscountStatus" AS ENUM ('ACTIVE', 'NOT_ACTIVE');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'RETURN_ACCEPTED', 'RETURN_REJECTED', 'RETURN_INITIATED', 'RETURN_PICKED');

-- CreateEnum
CREATE TYPE "ReplacementOrderStatus" AS ENUM ('RECEIVED', 'REJECTED', 'INITIATED', 'ACCEPTED', 'PICKED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('CANCELED', 'PACKING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'REPLACED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('NEW', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- AlterEnum
ALTER TYPE "UserPermissionRole" ADD VALUE 'ADMIN_APPROVER';

-- DropIndex
DROP INDEX "User_mobile_key";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "name",
ADD COLUMN     "addressName" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT '+91',
ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "AddressType" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "pincode" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mobile",
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT '+91',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "permissions" TEXT[],
ADD COLUMN     "status" "UserAccountStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "roleName" "UserPermissionRole" NOT NULL,
    "rolePermission" TEXT[],
    "permissionType" "UserPermissionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cartTotal" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItems" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishListItems" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WishListItems_pkey" PRIMARY KEY ("id")
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
    "sizesAvailable" TEXT[],
    "sizeChart" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategorySizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategories" (
    "id" SERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "categorySizesId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "priorityIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "customisable" BOOLEAN DEFAULT false,
    "customisationOptionProductId" INTEGER,
    "siblingProductId" INTEGER,
    "discountId" INTEGER,
    "basePrice" INTEGER NOT NULL,
    "finalPrice" INTEGER NOT NULL,
    "avlSizeQuantity" JSONB,
    "returnAvl" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "SKU" VARCHAR(8) NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "skuPrice" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productCategoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSku" (
    "SKU" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductSku_pkey" PRIMARY KEY ("SKU","productId")
);

-- CreateTable
CREATE TABLE "vendorOrder" (
    "id" SERIAL NOT NULL,
    "vendorName" TEXT NOT NULL,
    "vendorAddress" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "advPayment" TEXT NOT NULL,
    "advPaymentMode" TEXT NOT NULL,
    "advPaymentDate" TIMESTAMP(3) NOT NULL,
    "advPaymentTransactionId" TEXT NOT NULL,
    "finalPayment" TEXT,
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
    "paymentId" TEXT NOT NULL,
    "paymentService" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Returns" (
    "id" SERIAL NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "returnReason" TEXT NOT NULL,
    "returnReceiveDate" TIMESTAMP(3),
    "paymentId" INTEGER,
    "orderId" INTEGER NOT NULL,
    "returnShipmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Returns_pkey" PRIMARY KEY ("id")
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
    "replacementReasonId" INTEGER NOT NULL,
    "replacementRequiredPhoto" TEXT,
    "replacementRequiredVideo" TEXT,
    "replacementSize" TEXT NOT NULL,
    "productOrderId" INTEGER NOT NULL,
    "returnShipmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplacementOrder_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "OrderProducts" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productStatus" "ProductStatus" NOT NULL DEFAULT 'PACKING',
    "size" TEXT NOT NULL,

    CONSTRAINT "OrderProducts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" SERIAL NOT NULL,
    "type" "OrderType" DEFAULT 'NEW',
    "finalPrice" TEXT NOT NULL,
    "originalOrderId" INTEGER,
    "userId" INTEGER NOT NULL,
    "productCount" INTEGER NOT NULL,
    "addressId" INTEGER NOT NULL,
    "discountId" INTEGER,
    "countryCode" TEXT NOT NULL DEFAULT '+91',
    "contactNumber" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus",
    "paymentId" INTEGER,
    "shipmentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewRating" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "reviewImages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_customisationOptionProductId_key" ON "Products"("customisationOptionProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_SKU_key" ON "Inventory"("SKU");

-- CreateIndex
CREATE UNIQUE INDEX "Returns_paymentId_key" ON "Returns"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Returns_orderId_key" ON "Returns"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Returns_returnShipmentId_key" ON "Returns"("returnShipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_productOrderId_key" ON "ReplacementOrder"("productOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementOrder_returnShipmentId_key" ON "ReplacementOrder"("returnShipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentOrderId_key" ON "Shipment"("shipmentOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_shipmentId_key" ON "Orders"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_contactNumber_key" ON "User"("contactNumber");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItems" ADD CONSTRAINT "CartItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishListItems" ADD CONSTRAINT "WishListItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishListItems" ADD CONSTRAINT "WishListItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discounts" ADD CONSTRAINT "Discounts_discountConditionId_fkey" FOREIGN KEY ("discountConditionId") REFERENCES "DiscountConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiscounts" ADD CONSTRAINT "UserDiscounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDiscounts" ADD CONSTRAINT "UserDiscounts_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountConditions" ADD CONSTRAINT "DiscountConditions_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategories" ADD CONSTRAINT "ProductCategories_categorySizesId_fkey" FOREIGN KEY ("categorySizesId") REFERENCES "ProductCategorySizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_customisationOptionProductId_fkey" FOREIGN KEY ("customisationOptionProductId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_siblingProductId_fkey" FOREIGN KEY ("siblingProductId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSku" ADD CONSTRAINT "ProductSku_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSku" ADD CONSTRAINT "ProductSku_SKU_fkey" FOREIGN KEY ("SKU") REFERENCES "Inventory"("SKU") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_returnShipmentId_fkey" FOREIGN KEY ("returnShipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_replacementReasonId_fkey" FOREIGN KEY ("replacementReasonId") REFERENCES "ReplacementReason"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_productOrderId_fkey" FOREIGN KEY ("productOrderId") REFERENCES "OrderProducts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_returnShipmentId_fkey" FOREIGN KEY ("returnShipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_originalOrderId_fkey" FOREIGN KEY ("originalOrderId") REFERENCES "Orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRating" ADD CONSTRAINT "ReviewRating_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRating" ADD CONSTRAINT "ReviewRating_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRating" ADD CONSTRAINT "ReviewRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
