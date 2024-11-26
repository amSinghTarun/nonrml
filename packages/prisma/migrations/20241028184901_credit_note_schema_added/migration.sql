/*
  Warnings:

  - The values [PROCESSING] on the enum `ReplacementOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACCEPTED] on the enum `ReturnItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `UserCredit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserCreditTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderRtoType" AS ENUM ('RETURN', 'REPLACEMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "ReplacementOrderStatus_new" AS ENUM ('PENDING', 'PROCESSED', 'SHIPPED', 'DELIVERED');
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" TYPE "ReplacementOrderStatus_new" USING ("status"::text::"ReplacementOrderStatus_new");
ALTER TYPE "ReplacementOrderStatus" RENAME TO "ReplacementOrderStatus_old";
ALTER TYPE "ReplacementOrderStatus_new" RENAME TO "ReplacementOrderStatus";
DROP TYPE "ReplacementOrderStatus_old";
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReturnItemStatus_new" AS ENUM ('PENDING', 'REJECTED', 'CONFIRMED');
ALTER TABLE "ReturnItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReturnItem" ALTER COLUMN "status" TYPE "ReturnItemStatus_new" USING ("status"::text::"ReturnItemStatus_new");
ALTER TYPE "ReturnItemStatus" RENAME TO "ReturnItemStatus_old";
ALTER TYPE "ReturnItemStatus_new" RENAME TO "ReturnItemStatus";
DROP TYPE "ReturnItemStatus_old";
ALTER TABLE "ReturnItem" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "ReturnStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "UserCredit" DROP CONSTRAINT "UserCredit_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserCreditTransaction" DROP CONSTRAINT "UserCreditTransaction_orderId_fkey";

-- DropForeignKey
ALTER TABLE "UserCreditTransaction" DROP CONSTRAINT "UserCreditTransaction_returnId_fkey";

-- DropForeignKey
ALTER TABLE "UserCreditTransaction" DROP CONSTRAINT "UserCreditTransaction_userCreditId_fkey";

-- DropTable
DROP TABLE "UserCredit";

-- DropTable
DROP TABLE "UserCreditTransaction";

-- CreateTable
CREATE TABLE "CreditNotes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "creditCode" TEXT NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "returnOrderId" INTEGER NOT NULL,
    "orderRtoType" "OrderRtoType" NOT NULL,
    "partiallyUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditNotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNotesPartialUseTransactions" (
    "id" SERIAL NOT NULL,
    "creditNoteId" INTEGER NOT NULL,
    "valueUtilised" DECIMAL(65,30) NOT NULL,
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditNotesPartialUseTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditNotesPartialUseTransactions_orderId_key" ON "CreditNotesPartialUseTransactions"("orderId");

-- AddForeignKey
ALTER TABLE "CreditNotes" ADD CONSTRAINT "CreditNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNotes" ADD CONSTRAINT "CreditNotes_returnOrderId_fkey" FOREIGN KEY ("returnOrderId") REFERENCES "Returns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNotesPartialUseTransactions" ADD CONSTRAINT "CreditNotesPartialUseTransactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditNotesPartialUseTransactions" ADD CONSTRAINT "CreditNotesPartialUseTransactions_creditNoteId_fkey" FOREIGN KEY ("creditNoteId") REFERENCES "CreditNotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
