/*
  Warnings:

  - The values [EXCHANGE] on the enum `ReturnType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReturnType_new" AS ENUM ('RETURN', 'REPLACEMENT');
ALTER TABLE "Returns" ALTER COLUMN "returnType" DROP DEFAULT;
ALTER TABLE "Returns" ALTER COLUMN "returnType" TYPE "ReturnType_new" USING ("returnType"::text::"ReturnType_new");
ALTER TYPE "ReturnType" RENAME TO "ReturnType_old";
ALTER TYPE "ReturnType_new" RENAME TO "ReturnType";
DROP TYPE "ReturnType_old";
ALTER TABLE "Returns" ALTER COLUMN "returnType" SET DEFAULT 'RETURN';
COMMIT;
