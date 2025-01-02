import PrismaIns from '@prisma/client'
export { Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaIns.PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaIns.PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const prismaEnums = PrismaIns.$Enums;

export type * as prismaTypes from "@prisma/client";