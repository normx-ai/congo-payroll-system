import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

// GET /api/employees/[id]/charges-fixes - Récupérer les charges fixes d'un employé
async function handleGetChargesFixes(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: employeeId } = await params

    // Vérifier que l'employé appartient au tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: session.user.tenantId
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    const chargesFixes = await prisma.employeeChargeFixe.findMany({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        rubriqueCode: 'asc'
      }
    })

    return NextResponse.json(chargesFixes)
  } catch (error) {
    return handleCatchError(error)
  }
}

// POST /api/employees/[id]/charges-fixes - Créer ou mettre à jour une charge fixe
async function handleCreateOrUpdateChargeFixe(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id: employeeId } = await params
    const body = await request.json()
    const { rubriqueCode, amount, isActive = true } = body

    if (!rubriqueCode || amount === undefined) {
      return NextResponse.json({ error: 'rubriqueCode et amount sont requis' }, { status: 400 })
    }

    // Vérifier que l'employé appartient au tenant
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: session.user.tenantId
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employé non trouvé' }, { status: 404 })
    }

    // Créer ou mettre à jour la charge fixe
    const chargeFixe = await prisma.employeeChargeFixe.upsert({
      where: {
        employeeId_rubriqueCode: {
          employeeId: employeeId,
          rubriqueCode: rubriqueCode
        }
      },
      update: {
        amount: amount,
        isActive: isActive
      },
      create: {
        employeeId: employeeId,
        rubriqueCode: rubriqueCode,
        amount: amount,
        isActive: isActive
      }
    })

    return NextResponse.json(chargeFixe)
  } catch (error) {
    return handleCatchError(error)
  }
}

export const GET = handleGetChargesFixes
export const POST = handleCreateOrUpdateChargeFixe