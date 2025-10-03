// API Route pour la gestion des rubriques de paie - Next.js App Router

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'
import { Prisma } from '@prisma/client'

// GET - Lister toutes les rubriques disponibles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'gains', 'cotisations', 'retenues'
    const actif = searchParams.get('actif') // 'true', 'false'

    // 1. Récupérer toutes les rubriques depuis la base de données
    const whereClause: Prisma.RubriqueWhereInput = {
      tenantId: session.user.tenantId
    }

    // Filtre par statut actif
    if (actif !== null) {
      whereClause.isActive = actif === 'true'
    }

    // Filtre par type
    if (type === 'gains') {
      whereClause.type = { in: ['GAIN_BRUT', 'GAIN_NON_SOUMIS'] }
    } else if (type === 'cotisations') {
      whereClause.type = 'COTISATION'
    } else if (type === 'retenues') {
      whereClause.type = { in: ['RETENUE_NON_SOUMISE', 'ELEMENT_NON_IMPOSABLE'] }
    }

    const rubriquesBD = await prisma.rubrique.findMany({
      where: whereClause,
      orderBy: { ordre: 'asc' }
    })

    // 2. Mapper les rubriques avec catégorie
    const rubriques = rubriquesBD.map(r => ({
      code: r.code,
      libelle: r.libelle,
      type: r.type,
      categorie: ['GAIN_BRUT', 'GAIN_NON_SOUMIS'].includes(r.type) ? 'gain' : 'cotisation',
      base: r.base,
      taux: r.taux ? Number(r.taux) : null,
      formule: r.formule,
      imposable: r.imposable,
      isActive: r.isActive
    }))

    // 3. Grouper par catégorie pour faciliter l'affichage
    const rubriquesParsCategorie = {
      gainsBrut: rubriques.filter(r => r.type === 'GAIN_BRUT'),
      cotisations: rubriques.filter(r => r.type === 'COTISATION'),
      gainsNonSoumis: rubriques.filter(r => r.type === 'GAIN_NON_SOUMIS'),
      retenuesNonSoumises: rubriques.filter(r => r.type === 'RETENUE_NON_SOUMISE'),
      elementsNonImposables: rubriques.filter(r => r.type === 'ELEMENT_NON_IMPOSABLE')
    }

    // 4. Statistiques
    const stats = {
      total: rubriques.length,
      actives: rubriques.filter(r => r.isActive).length,
      inactives: rubriques.filter(r => !r.isActive).length
    }

    return NextResponse.json({
      success: true,
      rubriques: rubriquesParsCategorie,
      listeComplete: rubriques,
      stats,
      filtres: { type, actif }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

// POST - Créer un profil de rubriques pour un employé ou groupe d'employés
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const {
      nomProfil,
      description,
      rubriquesSelectionnees, // Array des codes de rubriques
      parDefaut = false
    } = await req.json()

    // Validation
    if (!nomProfil || !Array.isArray(rubriquesSelectionnees)) {
      return NextResponse.json(
        { error: 'nomProfil et rubriquesSelectionnees (array) requis' },
        { status: 400 }
      )
    }

    // Vérifier que toutes les rubriques existent dans la base de données
    const toutesRubriques = await prisma.rubrique.findMany({
      where: { tenantId: session.user.tenantId }
    })

    const codesExistants = toutesRubriques.map(r => r.code)
    const codesInvalides = rubriquesSelectionnees.filter((code: string) => !codesExistants.includes(code))

    if (codesInvalides.length > 0) {
      return NextResponse.json(
        {
          error: 'Codes de rubriques invalides',
          codesInvalides: codesInvalides
        },
        { status: 400 }
      )
    }

    // S'assurer que les rubriques obligatoires sont incluses
    const rubriquesObligatoires = toutesRubriques
      .filter(r => r.isActive)
      .map(r => r.code)

    const manquantes = rubriquesObligatoires.filter(code => !rubriquesSelectionnees.includes(code))
    if (manquantes.length > 0) {
      return NextResponse.json(
        {
          error: 'Rubriques obligatoires manquantes',
          rubriquesManquantes: manquantes,
          suggestion: 'Les rubriques obligatoires seront ajoutées automatiquement'
        },
        { status: 400 }
      )
    }

    // Créer le profil (simulation - en production, sauvegarder en base)
    const profil = {
      id: `profil-${Date.now()}`,
      tenantId: session.user.tenantId,
      nom: nomProfil,
      description: description || '',
      rubriques: rubriquesSelectionnees,
      parDefaut,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id
    }

    // Détail des rubriques sélectionnées
    const detailRubriques = toutesRubriques
      .filter(r => rubriquesSelectionnees.includes(r.code))
      .map(r => ({
        code: r.code,
        libelle: r.libelle,
        type: r.type,
        isActive: r.isActive,
        base: r.base
      }))

    return NextResponse.json({
      success: true,
      message: 'Profil de rubriques créé avec succès',
      profil: {
        ...profil,
        detailRubriques: detailRubriques,
        statistiques: {
          totalRubriques: rubriquesSelectionnees.length,
          actives: detailRubriques.filter(r => r.isActive).length,
          inactives: detailRubriques.filter(r => !r.isActive).length
        }
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}