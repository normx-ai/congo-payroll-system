import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/departments/[id] - Modifier un département
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
    const { name, description, isActive } = body

    const department = await prisma.department.update({
      where: { id, tenantId: session.user.tenantId },
      data: {
        name: name?.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Erreur modification département:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/departments/[id] - Supprimer un département
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

    // Vérifier s'il y a des employés dans ce département
    const employeesCount = await prisma.employee.count({
      where: { departmentId: id, tenantId: session.user.tenantId }
    })

    if (employeesCount > 0) {
      // Désactiver au lieu de supprimer
      const department = await prisma.department.update({
        where: { id, tenantId: session.user.tenantId },
        data: { isActive: false }
      })
      return NextResponse.json({
        department,
        message: 'Département désactivé car il contient des employés'
      })
    }

    // Supprimer si aucun employé
    await prisma.department.delete({
      where: { id, tenantId: session.user.tenantId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression département:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}