/*
  Warnings:

  - You are about to drop the column `partiallyUsed` on the `CreditNotes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CreditNotes" DROP COLUMN "partiallyUsed",
ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false;
