import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { employeeCreateSchema } from '@/lib/validations'
import { EmployeeService } from '@/lib/employee-service'
import { withRateLimit } from '@/lib/rate-limiter'
import { handleCatchError } from '@/lib/error-handler'
import { AuditService } from '@/lib/audit-service'
import { requireExercice } from '@/lib/exercice-guard'

// GET /api/employees - Liste des employés avec pagination et recherche
async function handleGetEmployees(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier qu'un exercice existe
    const exerciceGuard = await requireExercice(session.user.tenantId)
    if (exerciceGuard) {
      return exerciceGuard
    }

    const { searchParams } = request.nextUrl
    const isActiveParam = searchParams.get('isActive')
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      size: Math.min(parseInt(searchParams.get('size') || '20'), 100),
      search: searchParams.get('search') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      contractType: searchParams.get('contractType') || undefined,
      isActive: isActiveParam === 'all' ? undefined : (isActiveParam !== 'false')
    }

    const result = await EmployeeService.getEmployees(session.user.tenantId, params)
    return NextResponse.json(result)
  } catch (error) {
    return handleCatchError(error)
  }
}

// POST /api/employees - Créer un nouvel employé
async function handleCreateEmployee(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier qu'un exercice existe
    const exerciceGuard = await requireExercice(session.user.tenantId)
    if (exerciceGuard) {
      return exerciceGuard
    }

    const body = await request.json()
    const validatedData = employeeCreateSchema.parse(body)

    const employee = await EmployeeService.createEmployee(session.user.tenantId, validatedData)

    // Log de l'audit
    await AuditService.logEmployeeAction(
      'CREATE',
      employee.id,
      session.user.tenantId,
      session.user.id,
      request,
      undefined,
      {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        baseSalary: Number(employee.baseSalary),
        isActive: employee.isActive,
        hireDate: employee.hireDate
      }
    )

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = withRateLimit(handleGetEmployees, 'api')
export const POST = withRateLimit(handleCreateEmployee, 'create')