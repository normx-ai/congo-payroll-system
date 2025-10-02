import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * Vérifie qu'un exercice comptable existe pour le tenant
 * @param tenantId - ID du tenant
 * @returns Promise<boolean> - true si un exercice existe
 */
export async function hasActiveExercice(tenantId: string): Promise<boolean> {
  try {
    const exerciceCount = await prisma.exercice.count({
      where: { tenantId }
    })
    return exerciceCount > 0
  } catch (error) {
    console.error('Erreur vérification exercice:', error)
    return false
  }
}

/**
 * Middleware pour protéger les routes qui nécessitent un exercice
 * @param tenantId - ID du tenant
 * @returns Promise<NextResponse | null> - Response d'erreur si pas d'exercice, null sinon
 */
export async function requireExercice(tenantId: string): Promise<NextResponse | null> {
  const hasExercice = await hasActiveExercice(tenantId)

  if (!hasExercice) {
    return NextResponse.json({
      error: 'Exercice comptable requis',
      message: 'Vous devez créer un exercice comptable dans les paramètres avant d\'utiliser cette fonctionnalité.',
      code: 'EXERCICE_REQUIRED'
    }, { status: 423 }) // 423 Locked
  }

  return null
}

/**
 * Wrapper pour protéger une fonction API
 * @param handler - Fonction handler à protéger
 * @param tenantId - ID du tenant
 */
export async function withExerciceGuard<T>(
  handler: () => Promise<T>,
  tenantId: string
): Promise<T | NextResponse> {
  const guardResponse = await requireExercice(tenantId)
  if (guardResponse) {
    return guardResponse
  }

  return handler()
}