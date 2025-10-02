// API Route pour génération par lot de bulletins - Next.js App Router

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCatchError } from '@/lib/error-handler'
import { requireExercice } from '@/lib/exercice-guard'
import { BulletinService } from '@/lib/payroll/bulletin-service'

interface BatchResult {
  employeeId: string
  nom: string
  raison?: string
  bulletinId?: string
  erreur?: string
}

interface BatchResults {
  success: BatchResult[]
  errors: BatchResult[]
  skipped: BatchResult[]
}
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // 2. Vérifier qu'un exercice existe
    const exerciceGuard = await requireExercice(session.user.tenantId)
    if (exerciceGuard) {
      return exerciceGuard
    }

    // 3. Extraire les paramètres
    const { periode, employeeIds, rubriquesSaisies = [], chargesDeductibles = 0 } = await req.json()

    // 4. Validation
    if (!periode || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json(
        { error: 'periode et employeeIds (array) requis' },
        { status: 400 }
      )
    }

    if (!/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json(
        { error: 'Format période invalide (attendu: YYYY-MM)' },
        { status: 400 }
      )
    }

    // Limitation à 50 employés par lot
    if (employeeIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 employés par lot' },
        { status: 400 }
      )
    }

    // 5. Vérifier les employés
    const validEmployees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        tenantId: session.user.tenantId,
        isActive: true
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true
      }
    })

    if (validEmployees.length !== employeeIds.length) {
      return NextResponse.json(
        { error: `${employeeIds.length - validEmployees.length} employé(s) invalide(s) ou inactif(s)` },
        { status: 400 }
      )
    }

    // 6. Générer les bulletins
    const results: BatchResults = {
      success: [],
      errors: [],
      skipped: []
    }

    for (const employee of validEmployees) {
      try {
        // Vérifier si le bulletin existe déjà
        const existingBulletin = await BulletinService.checkExistingBulletin(employee.id, periode)

        if (existingBulletin) {
          results.skipped.push({
            employeeId: employee.id,
            nom: `${employee.firstName} ${employee.lastName}`,
            raison: 'Bulletin déjà existant'
          })
          continue
        }

        // Générer le bulletin
        const result = await BulletinService.generateBulletin({
          employeeId: employee.id,
          periode,
          rubriquesSaisies,
          chargesDeductibles,
          tenantId: session.user.tenantId
        })

        if (result.success) {
          results.success.push({
            employeeId: employee.id,
            bulletinId: result.bulletinId,
            nom: `${employee.firstName} ${employee.lastName}`
          })
        } else {
          results.errors.push({
            employeeId: employee.id,
            nom: `${employee.firstName} ${employee.lastName}`,
            erreur: result.error
          })
        }

      } catch (error) {
        results.errors.push({
          employeeId: employee.id,
          nom: `${employee.firstName} ${employee.lastName}`,
          erreur: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    // 7. Retourner le résumé
    return NextResponse.json({
      success: true,
      periode,
      total: validEmployees.length,
      résultats: {
        générés: results.success.length,
        erreurs: results.errors.length,
        ignorés: results.skipped.length
      },
      détails: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return handleCatchError(error)
  }
}