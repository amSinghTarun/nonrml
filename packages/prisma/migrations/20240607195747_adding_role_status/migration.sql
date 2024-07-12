/*
  Warnings:

  - A unique constraint covering the columns `[roleName]` on the table `Roles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Status` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roles" ADD COLUMN     "Status" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleName_key" ON "Roles"("roleName");
