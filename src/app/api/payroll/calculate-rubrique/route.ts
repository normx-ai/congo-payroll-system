/**
 * API pour calculer une rubrique avec le moteur unifié
 * Utilisé par le client pour avoir les mêmes calculs que le serveur
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SharedPayrollEngine } from '@/lib/payroll/shared-payroll-engine'
import { RubriquesService } from '@/lib/services/rubriques.service'

export async function POST(req: NextRequest) {
  try {
    // Authentification
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant non trouvé' }, { status: 400 })
    }

    // Récupération des paramètres
    const body = await req.json()
    const {
      rubriqueCode,
      employeeId,
      periode, // Format: YYYY-MM
      brutSocial,
      brutFiscal,
      joursTravailles,
      employee,
      chargesDeductibles,
      quotientFamilial
    } = body

    // Validation
    if (!rubriqueCode) {
      return NextResponse.json({ error: 'rubriqueCode requis' }, { status: 400 })
    }

    if (!periode) {
      return NextResponse.json({ error: 'periode requis' }, { status: 400 })
    }

    // Récupérer la rubrique depuis la DB
    const rubrique = await RubriquesService.getRubrique(tenantId, rubriqueCode)

    if (!rubrique) {
      return NextResponse.json({ error: `Rubrique ${rubriqueCode} non trouvée` }, { status: 404 })
    }

    // Construire le contexte de calcul
    const [year, month] = periode.split('-')
    const periodeDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))

    const context = {
      tenantId,
      employee: employee || {
        id: employeeId || '',
        baseSalary: 0
      },
      periode: periodeDate,
      joursTravailles: joursTravailles || 26,
      brutSocial: brutSocial || 0,
      brutFiscal: brutFiscal || 0,
      chargesDeductibles: chargesDeductibles || 0,
      quotientFamilial: quotientFamilial || 1,
      rubriquesSaisies: []
    }

    // Calculer la rubrique avec le moteur unifié
    const result = await SharedPayrollEngine.calculateRubriqueValue(rubrique, context)

    return NextResponse.json({
      success: true,
      rubrique: result
    })

  } catch (error) {
    console.error('Erreur lors du calcul de rubrique:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
