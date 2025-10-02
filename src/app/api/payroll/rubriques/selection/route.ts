// API Route pour la sélection de rubriques par bulletin - Next.js App Router
// Refactorisé pour utiliser RubriqueSelectionService

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { handleCatchError } from '@/lib/error-handler'
import { RubriqueSelectionService } from '@/lib/payroll/rubrique-selection-service'

// POST - Génère une sélection personnalisée de rubriques
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const requestData = await req.json()

    // Traiter la sélection avec le service
    const result = RubriqueSelectionService.processSelection(requestData)

    if (!result.success) {
      const statusCode = result.codesInvalides ? 400 : 422
      return NextResponse.json({
        error: result.error,
        ...(result.codesInvalides && { codesInvalides: result.codesInvalides })
      }, { status: statusCode })
    }

    // Générer les statistiques
    const stats = RubriqueSelectionService.generateStats(result.rubriquesFinales!)

    return NextResponse.json({
      success: true,
      data: {
        rubriques: result.rubriquesFinales,
        obligatoires: result.rubriquesObligatoires,
        statistiques: stats
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

// GET - Récupère toutes les rubriques disponibles par catégorie
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const allRubriques = RubriqueSelectionService.getAllRubriquesByCategory()

    // Filtrer par catégorie si spécifiée
    if (category) {
      const validCategories = ['gains', 'retenues', 'obligatoires', 'inactives']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Catégorie invalide. Valeurs acceptées: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        category,
        rubriques: allRubriques[category as keyof typeof allRubriques],
        count: allRubriques[category as keyof typeof allRubriques].length
      })
    }

    // Retourner toutes les catégories avec leurs statistiques
    return NextResponse.json({
      success: true,
      data: allRubriques,
      statistiques: {
        gains: allRubriques.gains.length,
        retenues: allRubriques.retenues.length,
        obligatoires: allRubriques.obligatoires.length,
        inactives: allRubriques.inactives.length,
        total: Object.values(allRubriques).flat().length
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}