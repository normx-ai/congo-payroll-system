import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { employeeUpdateSchema } from '@/lib/validations'
import { EmployeeService } from '@/lib/employee-service'

// GET /api/employees/[id] - Récupérer un employé par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const employee = await EmployeeService.getEmployeeById(session.user.tenantId, id)
    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Erreur récupération employé:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/employees/[id] - Modifier un employé
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
    const validatedData = employeeUpdateSchema.parse(body)

    const employee = await EmployeeService.getEmployeeById(session.user.tenantId, id)
    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    const updatedEmployee = await EmployeeService.updateEmployee(
      session.user.tenantId,
      id,
      validatedData
    )

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error('Erreur modification employé:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - Soft delete d'un employé
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

    await EmployeeService.deleteEmployee(session.user.tenantId, id)
    return NextResponse.json({
      success: true,
      message: 'Employé supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur suppression employé:', error)

    if (error instanceof Error && error.message === 'DEACTIVATE_ONLY') {
      return NextResponse.json({
        success: true,
        deactivated: true,
        message: 'Employé désactivé (il a des bulletins de paie associés)'
      })
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}