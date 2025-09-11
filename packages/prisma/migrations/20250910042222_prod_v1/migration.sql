/*
  Warnings:

  - The values [PENDING,CONFIRMED,FAILED,attempted,paid] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REVIEW_DONE] on the enum `ReturnStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `countryCode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Address` table. All the data in the column will be lost.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `referenceImage` on the `ReturnItem` table. All the data in the column will be lost.
  - You are about to drop the column `returnReason` on the `ReturnItem` table. All the data in the column will be lost.
  - You are about to drop the column `shipmentTrackingLink` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `OrderProducts` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `orderId` on the `CreditNotesPartialUseTransactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `OrderProducts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `email` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idVarChar` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orderId` on the `Payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `ReplacementOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `orderId` on the `Returns` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "HomeImageType" AS ENUM ('TOP_MD', 'TOP_LG', 'MIDDLE_MD', 'MIDDLE_LG', 'BOTTOM');

-- CreateEnum
CREATE TYPE "PaymentStatusOld" AS ENUM ('PENDING', 'retarted_CONFIRMED', 'COD', 'created', 'attempted', 'paid', 'failed');

-- AlterEnum
ALTER TYPE "CreditNotePurpose" ADD VALUE 'ORDER';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELED_ADMIN';

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('created', 'authorized', 'captured', 'refunded', 'failed', 'pending');
ALTER TABLE "Payments" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Payments" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Payments" ALTER COLUMN "paymentStatus" SET DEFAULT 'created';
COMMIT;

-- AlterEnum
ALTER TYPE "ReplacementOrderStatus" ADD VALUE 'ASSESSED';

-- AlterEnum
BEGIN;
CREATE TYPE "ReturnStatus_new" AS ENUM ('PENDING', 'ASSESSED', 'CANCELLED_ADMIN', 'RECEIVED', 'CANCELLED', 'IN_TRANSIT', 'ALLOWED');
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" DROP DEFAULT;
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" TYPE "ReturnStatus_new" USING ("returnStatus"::text::"ReturnStatus_new");
ALTER TYPE "ReturnStatus" RENAME TO "ReturnStatus_old";
ALTER TYPE "ReturnStatus_new" RENAME TO "ReturnStatus";
DROP TYPE "ReturnStatus_old";
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "CreditNotesPartialUseTransactions" DROP CONSTRAINT "CreditNotesPartialUseTransactions_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderProducts" DROP CONSTRAINT "OrderProducts_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payments" DROP CONSTRAINT "Payments_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ReplacementOrder" DROP CONSTRAINT "ReplacementOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Returns" DROP CONSTRAINT "Returns_orderId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "countryCode",
DROP COLUMN "email";

-- AlterTable
ALTER TABLE "CreditNotes" ADD COLUMN     "email" TEXT NOT NULL DEFAULT 'tarunsingh2118@gmail.com',
ADD COLUMN     "orderId" INTEGER,
ADD COLUMN     "replacementOrderId" INTEGER;

-- AlterTable
ALTER TABLE "CreditNotesPartialUseTransactions" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderProducts" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "idVarChar" TEXT NOT NULL,
ADD COLUMN     "processingRefundAmount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "addressId" DROP NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Payments" ADD COLUMN     "conflict" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ALTER COLUMN "paymentStatus" SET DEFAULT 'created',
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "latest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RefundTransactions" ADD COLUMN     "trigger" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "creditNoteId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ReplacementOrder" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ReturnItem" DROP COLUMN "referenceImage",
DROP COLUMN "returnReason";

-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "images" TEXT[],
DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "shipmentTrackingLink",
ADD COLUMN     "AWB" TEXT DEFAULT '',
ADD COLUMN     "dimensions" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shipmentId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "countryCode",
ALTER COLUMN "otp" DROP NOT NULL,
ALTER COLUMN "otpExpire" DROP NOT NULL;

-- CreateTable
CREATE TABLE "HomePageImages" (
    "id" SERIAL NOT NULL,
    "legacyType" "HomeImageType" NOT NULL,
    "currentType" "HomeImageType" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedAt" TIMESTAMP(6),
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "HomePageImages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicConfig" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "dynamicConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomePageImages_id_key" ON "HomePageImages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DynamicConfig_key_key" ON "DynamicConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CreditNotesPartialUseTransactions_orderId_key" ON "CreditNotesPartialUseTransactions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProducts_id_key" ON "OrderProducts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProducts_orderId_productVariantId_key" ON "OrderProducts"("orderId", "productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_id_key" ON "Orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_orderId_key" ON "Payments"("orderId");

-- AddForeignKey
ALTER TABLE "CreditNotes" ADD CONSTRAINT "CreditNotes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CreditNotes" ADD CONSTRAINT "CreditNotes_replacementOrderId_fkey" FOREIGN KEY ("replacementOrderId") REFERENCES "ReplacementOrder"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CreditNotesPartialUseTransactions" ADD CONSTRAINT "CreditNotesPartialUseTransactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrderProducts" ADD CONSTRAINT "OrderProducts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Returns" ADD CONSTRAINT "Returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ReplacementOrder" ADD CONSTRAINT "ReplacementOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
