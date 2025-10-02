import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

/**
 * GET /api/parametres/irpp
 * Récupère le barème IRPP actif pour le tenant
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const searchParams = req.nextUrl.searchParams
    const periode = searchParams.get('periode')
      ? new Date(searchParams.get('periode')!)
      : new Date()

    const tranches = await prisma.irppTranche.findMany({
      where: {
        tenantId,
        isActive: true,
        dateEffet: { lte: periode },
        OR: [
          { dateFin: null },
          { dateFin: { gte: periode } }
        ]
      },
      orderBy: { ordre: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: tranches.map(t => ({
        id: t.id,
        ordre: t.ordre,
        seuil_min: Number(t.seuil_min),
        seuil_max: t.seuil_max ? Number(t.seuil_max) : null,
        taux: Number(t.taux),
        description: t.description,
        dateEffet: t.dateEffet,
        dateFin: t.dateFin
      }))
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

/**
 * PUT /api/parametres/irpp
 * Met à jour une tranche IRPP
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await req.json()
    const { id, taux, dateEffet } = body

    if (!id || taux === undefined) {
      return NextResponse.json(
        { error: 'Paramètres manquants: id et taux requis' },
        { status: 400 }
      )
    }

    // Récupérer la tranche actuelle
    const currentTranche = await prisma.irppTranche.findUnique({
      where: { id }
    })

    if (!currentTranche || currentTranche.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Tranche non trouvée' },
        { status: 404 }
      )
    }

    const effectiveDate = dateEffet ? new Date(dateEffet) : new Date()

    // Si la date d'effet est dans le futur, créer une nouvelle version
    if (effectiveDate > new Date()) {
      // Désactiver les versions futures existantes pour cet ordre
      await prisma.irppTranche.updateMany({
        where: {
          tenantId,
          ordre: currentTranche.ordre,
          dateEffet: { gte: effectiveDate }
        },
        data: { isActive: false }
      })

      // Créer nouvelle version
      const newTranche = await prisma.irppTranche.create({
        data: {
          tenantId,
          ordre: currentTranche.ordre,
          seuil_min: currentTranche.seuil_min,
          seuil_max: currentTranche.seuil_max,
          taux,
          description: currentTranche.description,
          dateEffet: effectiveDate,
          dateFin: null,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Nouvelle version créée',
        data: newTranche
      })
    } else {
      // Mise à jour immédiate
      const updated = await prisma.irppTranche.update({
        where: { id },
        data: { taux }
      })

      return NextResponse.json({
        success: true,
        message: 'Tranche mise à jour',
        data: updated
      })
    }

  } catch (error) {
    return handleCatchError(error)
  }
}
