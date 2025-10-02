import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createExerciceSchema = z.object({
  libelle: z.string().min(1, 'Le libellé est requis'),
  annee: z.number().int().min(2020).max(2030),
  dateDebut: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date de début invalide'),
  dateFin: z.string().refine((date) => !isNaN(Date.parse(date)), 'Date de fin invalide'),
  description: z.string().optional()
})

// GET /api/exercices - Liste des exercices du tenant
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const exercices = await prisma.exercice.findMany({
      where: { tenantId: session.user.tenantId },
      orderBy: { annee: 'desc' }
    })

    return NextResponse.json({ exercices })
  } catch (error) {
    console.error('Erreur récupération exercices:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/exercices - Créer un nouvel exercice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createExerciceSchema.parse(body)

    // Vérifier unicité de l'année pour ce tenant
    const existingExercice = await prisma.exercice.findFirst({
      where: {
        tenantId: session.user.tenantId,
        annee: validatedData.annee
      }
    })

    if (existingExercice) {
      return NextResponse.json(
        { error: `Un exercice pour l'année ${validatedData.annee} existe déjà` },
        { status: 409 }
      )
    }

    const exercice = await prisma.exercice.create({
      data: {
        tenantId: session.user.tenantId,
        libelle: validatedData.libelle,
        annee: validatedData.annee,
        dateDebut: new Date(validatedData.dateDebut),
        dateFin: new Date(validatedData.dateFin),
        description: validatedData.description
      }
    })

    return NextResponse.json(exercice, { status: 201 })
  } catch (error) {
    console.error('Erreur création exercice:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}