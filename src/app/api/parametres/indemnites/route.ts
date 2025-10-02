import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

/**
 * GET /api/parametres/indemnites
 * Récupère tous les barèmes d'indemnités actifs pour le tenant
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

    const baremes = await prisma.baremeIndemnite.findMany({
      where: {
        tenantId,
        isActive: true,
        dateEffet: { lte: periode },
        OR: [
          { dateFin: null },
          { dateFin: { gte: periode } }
        ]
      },
      orderBy: [
        { type: 'asc' },
        { ordre: 'asc' }
      ]
    })

    // Grouper par type
    const grouped = baremes.reduce((acc, bareme) => {
      const type = bareme.type
      if (!acc[type]) acc[type] = []
      acc[type].push({
        id: bareme.id,
        type: bareme.type,
        libelle: bareme.libelle,
        description: bareme.description,
        seuilMin: bareme.seuilMin,
        seuilMax: bareme.seuilMax,
        taux: bareme.taux ? Number(bareme.taux) : null,
        montantMois: bareme.montantMois,
        ancienneteMinMois: bareme.ancienneteMinMois,
        ordre: bareme.ordre,
        dateEffet: bareme.dateEffet,
        dateFin: bareme.dateFin
      })
      return acc
    }, {} as Record<string, Array<{
      id: string
      type: string
      libelle: string
      description: string | null
      seuilMin: number | null
      seuilMax: number | null
      taux: number | null
      montantMois: number | null
      ancienneteMinMois: number | null
      ordre: number
      dateEffet: Date
      dateFin: Date | null
    }>>)

    return NextResponse.json({
      success: true,
      data: {
        baremes,
        grouped
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

/**
 * PUT /api/parametres/indemnites
 * Met à jour un barème d'indemnité
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await req.json()
    const { id, taux, montantMois, dateEffet } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre manquant: id requis' },
        { status: 400 }
      )
    }

    // Récupérer le barème actuel
    const currentBareme = await prisma.baremeIndemnite.findUnique({
      where: { id }
    })

    if (!currentBareme || currentBareme.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Barème non trouvé' },
        { status: 404 }
      )
    }

    const effectiveDate = dateEffet ? new Date(dateEffet) : new Date()

    // Si la date d'effet est dans le futur, créer une nouvelle version
    if (effectiveDate > new Date()) {
      // Désactiver les versions futures existantes
      await prisma.baremeIndemnite.updateMany({
        where: {
          tenantId,
          type: currentBareme.type,
          ordre: currentBareme.ordre,
          dateEffet: { gte: effectiveDate }
        },
        data: { isActive: false }
      })

      // Créer nouvelle version
      const newBareme = await prisma.baremeIndemnite.create({
        data: {
          tenantId,
          type: currentBareme.type,
          libelle: currentBareme.libelle,
          description: currentBareme.description,
          seuilMin: currentBareme.seuilMin,
          seuilMax: currentBareme.seuilMax,
          taux: taux !== undefined ? taux : currentBareme.taux,
          montantMois: montantMois !== undefined ? montantMois : currentBareme.montantMois,
          ancienneteMinMois: currentBareme.ancienneteMinMois,
          ordre: currentBareme.ordre,
          dateEffet: effectiveDate,
          dateFin: null,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Nouvelle version créée',
        data: newBareme
      })
    } else {
      // Mise à jour immédiate
      const updateData: { taux?: number; montantMois?: number } = {}
      if (taux !== undefined) updateData.taux = taux
      if (montantMois !== undefined) updateData.montantMois = montantMois

      const updated = await prisma.baremeIndemnite.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({
        success: true,
        message: 'Barème mis à jour',
        data: updated
      })
    }

  } catch (error) {
    return handleCatchError(error)
  }
}
