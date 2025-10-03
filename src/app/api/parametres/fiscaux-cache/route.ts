import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ParametresFiscauxService } from '@/lib/services/parametres-fiscaux.service'

/**
 * GET /api/parametres/fiscaux-cache
 * Retourne tous les paramètres fiscaux nécessaires pour le calcul côté client
 * Avec cache pour optimiser les performances
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 2. Récupérer la période depuis les paramètres (optionnel, défaut = mois actuel)
    const { searchParams } = new URL(req.url)
    const periodeParam = searchParams.get('periode') // Format: YYYY-MM

    let periode: Date
    if (periodeParam && /^\d{4}-\d{2}$/.test(periodeParam)) {
      const [year, month] = periodeParam.split('-')
      periode = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))
    } else {
      periode = new Date()
    }

    // 3. Récupérer TOUS les paramètres fiscaux nécessaires
    const params = await ParametresFiscauxService.getParametres(
      session.user.tenantId,
      [
        // CNSS
        'CNSS_EMPLOYE',
        'CNSS_EMPLOYEUR',
        'CNSS_PLAFOND',
        // Allocations familiales
        'AF_TAUX',
        'AF_PLAFOND',
        // Accidents de travail
        'AT_TAUX',
        'AT_PLAFOND',
        // TUS
        'TUS_TAUX',
        'TUS_SS_TAUX',
        // CAMU
        'CAMU_CONTRIBUTION',
        'CAMU_SEUIL',
      ],
      periode
    )

    // 4. Retourner les paramètres avec headers de cache
    const response = NextResponse.json({
      success: true,
      data: {
        // CNSS
        cnss: {
          tauxEmploye: params.CNSS_EMPLOYE || 4,
          tauxEmployeur: params.CNSS_EMPLOYEUR || 8,
          plafond: params.CNSS_PLAFOND || 1200000,
        },
        // Allocations familiales
        allocationsFamiliales: {
          taux: params.AF_TAUX || 10.03,
          plafond: params.AF_PLAFOND || 600000,
        },
        // Accidents de travail
        accidentsTravail: {
          taux: params.AT_TAUX || 2.25,
          plafond: params.AT_PLAFOND || 600000,
        },
        // TUS (Taxe Unique sur Salaire)
        tus: {
          tauxAdminFiscale: params.TUS_TAUX || 4.125,
          tauxSecuSociale: params.TUS_SS_TAUX || 3.375,
        },
        // CAMU
        camu: {
          taux: params.CAMU_CONTRIBUTION || 0.5,
          seuil: params.CAMU_SEUIL || 500000,
        },
        // Taxes locales (montants fixes, pas de DB)
        taxesLocales: {
          local: 1000,
          expat: 5000,
          regionale: 2400,
        },
      },
      periode: periodeParam || new Date().toISOString().slice(0, 7),
      cachedAt: new Date().toISOString(),
    })

    // 5. Ajouter headers de cache (5 minutes)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')

    return response
  } catch (error) {
    console.error('[API fiscaux-cache] Erreur:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des paramètres fiscaux',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
