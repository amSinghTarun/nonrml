-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('RETURN', 'EXCHANGE');

-- AlterTable
ALTER TABLE "Returns" ADD COLUMN     "returnType" "ReturnType" NOT NULL DEFAULT 'RETURN';
