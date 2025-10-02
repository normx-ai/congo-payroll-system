import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EmployeeService } from '@/lib/employee-service'

// PATCH /api/employees/[id]/status - Activer/Désactiver un employé
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive doit être un booléen' }, { status: 400 })
    }

    const employee = await EmployeeService.getEmployeeById(session.user.tenantId, id)
    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    await EmployeeService.updateEmployeeStatus(session.user.tenantId, id, isActive)

    return NextResponse.json({
      success: true,
      message: `Employé ${isActive ? 'activé' : 'désactivé'} avec succès`
    })
  } catch (error) {
    console.error('Erreur changement statut employé:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}