/*
  Warnings:

  - The values [CONFIRMED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PROCESSED] on the enum `ReplacementOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIRMED,PICKED,PROCESSED,PROCESSING] on the enum `ReturnStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `cartTotal` on the `Cart` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `orderRtoType` on the `CreditNotes` table. All the data in the column will be lost.
  - You are about to drop the column `redeemed` on the `CreditNotes` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `CreditNotes` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `productStatus` on the `OrderProducts` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `OrderProducts` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `paymentId` on the `Orders` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `Orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `price` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `replacementQuantity` on the `ReplacementItem` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedQuantity` on the `ReturnItem` table. All the data in the column will be lost.
  - You are about to alter the column `refundAmount` on the `Returns` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `totalPrice` on the `vendorOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `advPayment` on the `vendorOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `finalPayment` on the `vendorOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - A unique constraint covering the columns `[rzpOrderId]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rzpPaymentId]` on the table `Payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId]` on the table `ProductCategorySizes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[returnItemId]` on the table `ReplacementItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `remainingValue` to the `CreditNotes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SizeType" AS ENUM ('MEASUREMENT_TYPE', 'SIZE_VALUE', 'DISPLAY_NAME');

-- CreateEnum
CREATE TYPE "CreditNotePurpose" AS ENUM ('RETURN', 'REPLACEMENT', 'GIFT');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'IN_TRANSIT', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'PAYMENT_FAILED', 'CANCELED');
ALTER TABLE "Orders" ALTER COLUMN "orderStatus" DROP DEFAULT;
ALTER TABLE "Orders" ALTER COLUMN "orderStatus" TYPE "OrderStatus_new" USING ("orderStatus"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Orders" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReplacementOrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED');
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" TYPE "ReplacementOrderStatus_new" USING ("status"::text::"ReplacementOrderStatus_new");
ALTER TYPE "ReplacementOrderStatus" RENAME TO "ReplacementOrderStatus_old";
ALTER TYPE "ReplacementOrderStatus_new" RENAME TO "ReplacementOrderStatus";
DROP TYPE "ReplacementOrderStatus_old";
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReturnStatus_new" AS ENUM ('PENDING', 'REVIEW_DONE', 'CANCELLED_ADMIN', 'RECEIVED', 'CANCELLED', 'IN_TRANSIT');
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" DROP DEFAULT;
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" TYPE "ReturnStatus_new" USING ("returnStatus"::text::"ReturnStatus_new");
ALTER TYPE "ReturnStatus" RENAME TO "ReturnStatus_old";
ALTER TYPE "ReturnStatus_new" RENAME TO "ReturnStatus";
DROP TYPE "ReturnStatus_old";
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_paymentId_fkey";

-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "cartTotal" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "CreditNotes" DROP COLUMN "orderRtoType",
DROP COLUMN "redeemed",
ADD COLUMN     "creditNoteOrigin" "CreditNotePurpose",
ADD COLUMN     "remainingValue" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "value" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "returnOrderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderProducts" DROP COLUMN "productStatus",
ADD COLUMN     "reimbursedQuantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "paymentId",
ADD COLUMN     "returnAcceptanceDate" BIGINT,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "orderId" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "sizeChartId" INTEGER;

-- AlterTable
ALTER TABLE "ProductCategorySizes" ADD COLUMN     "productId" INTEGER;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "colour" TEXT NOT NULL DEFAULT 'white',
ADD COLUMN     "public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sizeChartId" INTEGER,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ReplacementItem" DROP COLUMN "replacementQuantity",
ADD COLUMN     "nonReplacableQuantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "nonReplaceAction" DROP NOT NULL,
ALTER COLUMN "nonReplaceAction" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ReturnItem" DROP COLUMN "acceptedQuantity",
ADD COLUMN     "rejectedQuantity" INTEGER DEFAULT 0,
ALTER COLUMN "referenceImage" DROP NOT NULL,
ALTER COLUMN "returnReason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Returns" ALTER COLUMN "refundAmount" DROP DEFAULT,
ALTER COLUMN "refundAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "vendorOrder" ALTER COLUMN "totalPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "advPayment" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "finalPayment" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "SizeChart" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" "SizeType" NOT NULL,
    "parentId" INTEGER,
    "sortOrder" INTEGER DEFAULT 0,
    "createdat" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SizeChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundTransactions" (
    "id" BIGSERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6),
    "rzpRefundId" TEXT,
    "rzpRefundStatus" TEXT,
    "rzpPaymentId" TEXT NOT NULL,
    "bankRefundValue" INTEGER NOT NULL DEFAULT 0,
    "creditNoteId" INTEGER DEFAULT 0,

    CONSTRAINT "BankRefunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SizeChart_parentid_idx" ON "SizeChart"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "BankRefunds_rzpRefundId_key" ON "RefundTransactions"("rzpRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_rzpOrderId_key" ON "Payments"("rzpOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_rzpPaymentId_key" ON "Payments"("rzpPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategorySizes_productId_key" ON "ProductCategorySizes"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ReplacementItem_returnItemId_key" ON "ReplacementItem"("returnItemId");

-- AddForeignKey
ALTER TABLE "ProductCategorySizes" ADD CONSTRAINT "ProductCategorySizes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_sizeChartId_fkey" FOREIGN KEY ("sizeChartId") REFERENCES "SizeChart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SizeChart" ADD CONSTRAINT "SizeChart_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SizeChart"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefundTransactions" ADD CONSTRAINT "BankRefunds_rzpPaymentId_fkey" FOREIGN KEY ("rzpPaymentId") REFERENCES "Payments"("rzpPaymentId") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundTransactions" ADD CONSTRAINT "RefundTransactions_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "CreditNotes"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
