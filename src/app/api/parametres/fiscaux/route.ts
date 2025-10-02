import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

/**
 * GET /api/parametres/fiscaux
 * Récupère tous les paramètres fiscaux actifs pour le tenant
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

    const parametres = await prisma.fiscalParameter.findMany({
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

    // Grouper par catégorie
    const grouped = parametres.reduce((acc, param) => {
      let category = 'other'

      if (param.code.startsWith('CNSS_') || param.code.startsWith('CAMU_') ||
          param.code.startsWith('AF_') || param.code.startsWith('AT_')) {
        category = 'social'
      } else if (param.code.startsWith('TUS_') || param.code.startsWith('IRPP_') ||
                 param.code.includes('EXONERATION')) {
        category = 'tax'
      } else if (param.code.startsWith('HS_') || param.code.includes('HEURES_')) {
        category = 'overtime'
      }

      if (!acc[category]) acc[category] = []
      acc[category].push({
        id: param.id,
        code: param.code,
        libelle: param.libelle,
        type: param.type,
        value: Number(param.value),
        unit: param.unit || '',
        description: param.description || '',
        dateEffet: param.dateEffet,
        dateFin: param.dateFin
      })

      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      data: {
        parametres,
        grouped
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

/**
 * PUT /api/parametres/fiscaux
 * Met à jour un paramètre fiscal (crée une nouvelle version avec dateEffet)
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await req.json()
    const { id, value, dateEffet } = body

    if (!id || value === undefined) {
      return NextResponse.json(
        { error: 'Paramètres manquants: id et value requis' },
        { status: 400 }
      )
    }

    // Récupérer le paramètre actuel
    const currentParam = await prisma.fiscalParameter.findUnique({
      where: { id }
    })

    if (!currentParam || currentParam.tenantId !== tenantId) {
      return NextResponse.json(
        { error: 'Paramètre non trouvé' },
        { status: 404 }
      )
    }

    const effectiveDate = dateEffet ? new Date(dateEffet) : new Date()

    // Si la date d'effet est dans le futur, créer une nouvelle version
    if (effectiveDate > new Date()) {
      // Désactiver les versions futures existantes
      await prisma.fiscalParameter.updateMany({
        where: {
          tenantId,
          code: currentParam.code,
          dateEffet: { gte: effectiveDate }
        },
        data: { isActive: false }
      })

      // Créer nouvelle version
      const newParam = await prisma.fiscalParameter.create({
        data: {
          tenantId,
          code: currentParam.code,
          libelle: currentParam.libelle,
          type: currentParam.type,
          value,
          unit: currentParam.unit,
          description: currentParam.description,
          dateEffet: effectiveDate,
          dateFin: null,
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Nouvelle version créée',
        data: newParam
      })
    } else {
      // Mise à jour immédiate
      const updated = await prisma.fiscalParameter.update({
        where: { id },
        data: { value }
      })

      return NextResponse.json({
        success: true,
        message: 'Paramètre mis à jour',
        data: updated
      })
    }

  } catch (error) {
    return handleCatchError(error)
  }
}
