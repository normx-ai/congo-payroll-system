import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

/**
 * GET /api/parametres/quotient-familial
 * Récupère tous les barèmes de quotient familial actifs pour le tenant
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

    const baremes = await prisma.baremeQuotientFamilial.findMany({
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
        { situationFamiliale: 'asc' },
        { ordre: 'asc' }
      ]
    })

    // Grouper par situation familiale
    const grouped = baremes.reduce((acc, bareme) => {
      const situation = bareme.situationFamiliale
      if (!acc[situation]) acc[situation] = []
      acc[situation].push({
        id: bareme.id,
        situationFamiliale: bareme.situationFamiliale,
        nbEnfantsMin: bareme.nbEnfantsMin,
        nbEnfantsMax: bareme.nbEnfantsMax,
        parts: Number(bareme.parts),
        description: bareme.description,
        ordre: bareme.ordre,
        dateEffet: bareme.dateEffet,
        dateFin: bareme.dateFin
      })
      return acc
    }, {} as Record<string, Array<{
      id: string
      situationFamiliale: string
      nbEnfantsMin: number
      nbEnfantsMax: number | null
      parts: number
      description: string | null
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
 * PUT /api/parametres/quotient-familial
 * Met à jour un barème de quotient familial
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await req.json()
    const { id, parts, dateEffet } = body

    if (!id || parts === undefined) {
      return NextResponse.json(
        { error: 'Paramètres manquants: id et parts requis' },
        { status: 400 }
      )
    }

    // Récupérer le barème actuel
    const currentBareme = await prisma.baremeQuotientFamilial.findUnique({
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
      await prisma.baremeQuotientFamilial.updateMany({
        where: {
          tenantId,
          situationFamiliale: currentBareme.situationFamiliale,
          nbEnfantsMin: currentBareme.nbEnfantsMin,
          nbEnfantsMax: currentBareme.nbEnfantsMax,
          dateEffet: { gte: effectiveDate }
        },
        data: { isActive: false }
      })

      // Créer nouvelle version
      const newBareme = await prisma.baremeQuotientFamilial.create({
        data: {
          tenantId,
          situationFamiliale: currentBareme.situationFamiliale,
          nbEnfantsMin: currentBareme.nbEnfantsMin,
          nbEnfantsMax: currentBareme.nbEnfantsMax,
          parts: parts,
          description: currentBareme.description,
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
      const updated = await prisma.baremeQuotientFamilial.update({
        where: { id },
        data: { parts }
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
