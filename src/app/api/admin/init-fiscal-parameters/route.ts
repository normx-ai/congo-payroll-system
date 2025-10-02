import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const dateEffet = new Date('2025-01-01')

    // Vérifier si les paramètres existent déjà
    const existingParams = await prisma.fiscalParameter.count({
      where: { tenantId }
    })

    if (existingParams > 0) {
      return NextResponse.json({
        message: 'Paramètres fiscaux déjà initialisés',
        existingCount: existingParams
      })
    }

    // Créer les paramètres fiscaux de base
    const fiscalParams = [
      {
        tenantId,
        code: 'CNSS_TAUX_SALARIE',
        libelle: 'Taux cotisation CNSS salarié',
        type: 'TAUX' as const,
        value: 0.04,
        unit: '%',
        description: 'Taux de cotisation CNSS pour le salarié (4%)',
        dateEffet
      },
      {
        tenantId,
        code: 'CNSS_PLAFOND_ANNUEL',
        libelle: 'Plafond CNSS annuel',
        type: 'PLAFOND' as const,
        value: 14400000,
        unit: 'FCFA',
        description: 'Plafond annuel pour le calcul CNSS (14.4M FCFA)',
        dateEffet
      },
      {
        tenantId,
        code: 'FRAIS_PRO_TAUX',
        libelle: 'Taux déduction frais professionnels',
        type: 'TAUX' as const,
        value: 0.20,
        unit: '%',
        description: 'Taux de déduction forfaitaire frais professionnels (20%)',
        dateEffet
      }
    ]

    await prisma.fiscalParameter.createMany({
      data: fiscalParams
    })

    // Créer les tranches IRPP
    const irppTranches = [
      {
        tenantId,
        ordre: 1,
        seuil_min: 0,
        seuil_max: 464000,
        taux: 1,
        description: "Pour la fraction de revenu n'excédant pas 464.000 FCFA",
        dateEffet
      },
      {
        tenantId,
        ordre: 2,
        seuil_min: 464001,
        seuil_max: 1000000,
        taux: 10,
        description: "Pour la fraction comprise entre 464.001 et 1.000.000 FCFA",
        dateEffet
      },
      {
        tenantId,
        ordre: 3,
        seuil_min: 1000001,
        seuil_max: 3000000,
        taux: 25,
        description: "Pour la fraction comprise entre 1.000.001 et 3.000.000 FCFA",
        dateEffet
      },
      {
        tenantId,
        ordre: 4,
        seuil_min: 3000001,
        seuil_max: null,
        taux: 40,
        description: "Pour la fraction au-dessus de 3.000.000 FCFA",
        dateEffet
      }
    ]

    await prisma.irppTranche.createMany({
      data: irppTranches
    })

    return NextResponse.json({
      success: true,
      message: 'Paramètres fiscaux initialisés avec succès',
      created: {
        fiscalParameters: fiscalParams.length,
        irppTranches: irppTranches.length
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}