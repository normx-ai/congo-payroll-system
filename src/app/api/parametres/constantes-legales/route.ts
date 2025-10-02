import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

/**
 * GET /api/parametres/constantes-legales
 * Récupère toutes les constantes légales actives pour le tenant
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

    const constantes = await prisma.constanteLegale.findMany({
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
        { code: 'asc' }
      ]
    })

    // Grouper par type
    const grouped = constantes.reduce((acc, constante) => {
      const type = constante.type
      if (!acc[type]) acc[type] = []
      acc[type].push({
        id: constante.id,
        type: constante.type,
        code: constante.code,
        libelle: constante.libelle,
        valeur: Number(constante.valeur),
        unite: constante.unite,
        description: constante.description,
        dateEffet: constante.dateEffet,
        dateFin: constante.dateFin
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: {
        constantes,
        grouped
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

/**
 * PUT /api/parametres/constantes-legales
 * Met à jour une constante légale
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await req.json()
    const { id, valeur, dateEffet } = body

    if (!id || valeur === undefined) {
      return NextResponse.json(
        { error: 'Paramètres manquants: id et valeur requis' },
        { status: 400 }
      )
    }

    // Récupérer la constante actuelle
    const currentConstante = await prisma.constanteLegale.findUnique({
      where: { id }
    })

    if (!currentConstante || currentConstante.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Constante non trouvée' },
        { status: 404 }
      )
    }

    const effectiveDate = dateEffet ? new Date(dateEffet) : new Date()

    // Si la date d'effet est dans le futur, créer une nouvelle version
    if (effectiveDate > new Date()) {
      // Désactiver les versions futures existantes
      await prisma.constanteLegale.updateMany({
        where: {
          tenantId,
          code: currentConstante.code,
          dateEffet: { gte: effectiveDate }
        },
        data: { isActive: false }
      })

      // Créer nouvelle version
      const newConstante = await prisma.constanteLegale.create({
        data: {
          tenantId,
          type: currentConstante.type,
          code: currentConstante.code,
          libelle: currentConstante.libelle,
          valeur: valeur,
          unite: currentConstante.unite,
          description: currentConstante.description,
          dateEffet: effectiveDate,
          dateFin: null,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Nouvelle version créée',
        data: newConstante
      })
    } else {
      // Mise à jour immédiate
      const updated = await prisma.constanteLegale.update({
        where: { id },
        data: { valeur }
      })

      return NextResponse.json({
        success: true,
        message: 'Constante mise à jour',
        data: updated
      })
    }

  } catch (error) {
    return handleCatchError(error)
  }
}
