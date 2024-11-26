/*
  Warnings:

  - The values [RECEIVED,REJECTED,INITIATED,ACCEPTED] on the enum `ReplacementOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ACCEPTED,REJECTED] on the enum `ReturnStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReplacementOrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'SHIPPED', 'DELIVERED');
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" TYPE "ReplacementOrderStatus_new" USING ("status"::text::"ReplacementOrderStatus_new");
ALTER TYPE "ReplacementOrderStatus" RENAME TO "ReplacementOrderStatus_old";
ALTER TYPE "ReplacementOrderStatus_new" RENAME TO "ReplacementOrderStatus";
DROP TYPE "ReplacementOrderStatus_old";
ALTER TABLE "ReplacementOrder" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReturnStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'PICKED', 'PROCESSED');
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" DROP DEFAULT;
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" TYPE "ReturnStatus_new" USING ("returnStatus"::text::"ReturnStatus_new");
ALTER TYPE "ReturnStatus" RENAME TO "ReturnStatus_old";
ALTER TYPE "ReturnStatus_new" RENAME TO "ReturnStatus";
DROP TYPE "ReturnStatus_old";
ALTER TABLE "Returns" ALTER COLUMN "returnStatus" SET DEFAULT 'PENDING';
COMMIT;
