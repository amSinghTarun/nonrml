import { PrismaClient, $Enums } from '@prisma/client'
export { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const prismaEnums = $Enums;

export type * as prismaTypes from "@prisma/client";