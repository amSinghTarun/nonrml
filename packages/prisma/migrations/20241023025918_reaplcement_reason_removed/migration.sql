/*
  Warnings:

  - You are about to drop the column `replacementReasonId` on the `ReplacementOrder` table. All the data in the column will be lost.
  - You are about to drop the `ReplacementReason` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReplacementOrder" DROP CONSTRAINT "ReplacementOrder_replacementReasonId_fkey";

-- AlterTable
ALTER TABLE "ReplacementOrder" DROP COLUMN "replacementReasonId";

-- DropTable
DROP TABLE "ReplacementReason";
