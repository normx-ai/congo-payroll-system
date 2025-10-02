// API Route pour lister les bulletins de paie - Next.js App Router
// Refactorisé pour utiliser PayslipListService

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCatchError } from '@/lib/error-handler'
import { PayslipListService } from '@/lib/payroll/payslip-list-service'

export async function GET(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // 2. Extraire les paramètres
    const { searchParams } = new URL(req.url)
    const request = {
      tenantId: session.user.tenantId,
      periode: searchParams.get('periode') || undefined,
      employeId: searchParams.get('employeId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    }

    // 3. Utiliser le service pour récupérer les bulletins
    const result = await PayslipListService.getPayslipList(request)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      bulletins: result.bulletins,
      stats: result.stats,
      pagination: result.pagination,
      filters: result.filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return handleCatchError(error)
  }
}


// POST pour génération en lot
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { periode, employeIds } = await req.json()

    // Utiliser le service pour préparer la génération en lot
    const result = await PayslipListService.prepareBatchGeneration({
      tenantId: session.user.tenantId,
      periode,
      employeIds
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Génération en lot initiée',
      batch: result.batch,
      note: 'Utilisez l\'endpoint individuel /api/payroll/generate pour chaque employé'
    })

  } catch (error) {
    return handleCatchError(error)
  }
}