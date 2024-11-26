/*
  Warnings:

  - You are about to drop the column `quantity` on the `ReplacementItem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NonReplaceQantityAction" AS ENUM ('CREDIT');

-- AlterTable
ALTER TABLE "ReplacementItem" DROP COLUMN "quantity",
ADD COLUMN     "nonReplaceAction" "NonReplaceQantityAction" NOT NULL DEFAULT 'CREDIT',
ADD COLUMN     "replacementQuantity" INTEGER NOT NULL DEFAULT 0;
