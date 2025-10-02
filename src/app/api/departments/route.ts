import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/departments - Récupérer tous les départements
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      where: { tenantId: session.user.tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Erreur récupération départements:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/departments - Créer un département
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du département est requis' }, { status: 400 })
    }

    const department = await prisma.department.create({
      data: {
        tenantId: session.user.tenantId,
        code: name.toUpperCase().replace(/\s+/g, '_'),
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erreur création département:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}