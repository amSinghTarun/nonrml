/*
  Warnings:

  - You are about to drop the column `shipingDetails` on the `Products` table. All the data in the column will be lost.
  - Made the column `inspiration` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "shipingDetails",
ADD COLUMN     "shippingDetails" TEXT[],
ALTER COLUMN "inspiration" SET NOT NULL;
