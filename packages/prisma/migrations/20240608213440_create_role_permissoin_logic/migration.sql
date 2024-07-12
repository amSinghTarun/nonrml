/*
  Warnings:

  - You are about to drop the column `rolePermission` on the `Roles` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Roles` table. All the data in the column will be lost.
  - Added the required column `active` to the `Roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roles" DROP COLUMN "rolePermission",
DROP COLUMN "status",
ADD COLUMN     "active" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Permissions" (
    "id" SERIAL NOT NULL,
    "permissionName" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermissions" (
    "id" SERIAL NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "permissionName" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_permissionName_key" ON "Permissions"("permissionName");

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_permissionName_fkey" FOREIGN KEY ("permissionName") REFERENCES "Permissions"("permissionName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermissions" ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
