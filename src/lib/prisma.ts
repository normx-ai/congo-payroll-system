import { PrismaClient } from '@prisma/client'

// Type pour le global Prisma (pattern Next.js standard)
interface GlobalForPrisma {
  prisma: PrismaClient | undefined
}

const globalForPrisma = globalThis as typeof globalThis & GlobalForPrisma

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma