// API Route pour générer un bulletin de paie - Next.js App Router
// Refactorisé pour utiliser BulletinService

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCatchError } from '@/lib/error-handler'
import { requireExercice } from '@/lib/exercice-guard'
import { BulletinService } from '@/lib/payroll/bulletin-service'

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

    // 3. Extraire les paramètres de la requête
    const { employeeId, periode, rubriquesSaisies = [], chargesDeductibles = 0 } = await req.json()

    // 4. Utiliser le service pour générer le bulletin
    const result = await BulletinService.generateBulletin({
      employeeId,
      periode,
      rubriquesSaisies,
      chargesDeductibles,
      tenantId: session.user.tenantId
    })

    // 5. Gérer le résultat
    if (!result.success) {
      const statusCode = result.error?.includes('non trouvé') ? 404 : 400
      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      )
    }

    // 6. Retourner la réponse avec le PDF
    return new NextResponse(result.pdfBuffer ? new Uint8Array(result.pdfBuffer) : null, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bulletin-${periode}-${employeeId}.pdf"`,
        'X-Bulletin-Id': result.bulletinId || '',
        'X-Success': 'true'
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const periode = searchParams.get('periode')

    if (!employeeId || !periode) {
      return NextResponse.json(
        { error: 'employeeId et periode requis' },
        { status: 400 }
      )
    }

    // Rechercher le bulletin existant
    const existingBulletin = await BulletinService.checkExistingBulletin(employeeId, periode)

    if (!existingBulletin) {
      return NextResponse.json(
        { error: 'Bulletin non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      bulletin: {
        id: existingBulletin.id,
        periode: existingBulletin.periode,
        status: existingBulletin.status,
        grossSalary: Number(existingBulletin.grossSalary),
        netSalary: Number(existingBulletin.netSalary),
        createdAt: existingBulletin.createdAt
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}