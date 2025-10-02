import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/exercices/[id]/activate - Activer un exercice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'activate') {
      // Désactiver tous les autres exercices du tenant
      await prisma.exercice.updateMany({
        where: { tenantId: session.user.tenantId },
        data: { isActif: false }
      })

      // Activer l'exercice sélectionné
      const exercice = await prisma.exercice.update({
        where: {
          id,
          tenantId: session.user.tenantId
        },
        data: { isActif: true }
      })

      return NextResponse.json(exercice)
    }

    if (action === 'close') {
      const exercice = await prisma.exercice.update({
        where: {
          id,
          tenantId: session.user.tenantId
        },
        data: {
          isClos: true,
          isActif: false
        }
      })

      return NextResponse.json(exercice)
    }

    if (action === 'reopen') {
      const exercice = await prisma.exercice.update({
        where: {
          id,
          tenantId: session.user.tenantId
        },
        data: { isClos: false }
      })

      return NextResponse.json(exercice)
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Erreur modification exercice:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/exercices/[id] - Supprimer un exercice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'exercice appartient au tenant
    const exercice = await prisma.exercice.findFirst({
      where: {
        id,
        tenantId: session.user.tenantId
      }
    })

    if (!exercice) {
      return NextResponse.json({ error: 'Exercice non trouvé' }, { status: 404 })
    }

    if (exercice.isActif) {
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'exercice actif' },
        { status: 409 }
      )
    }

    await prisma.exercice.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Exercice supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression exercice:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}