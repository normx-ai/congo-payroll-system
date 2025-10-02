import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'
import { BulletinStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Filtres
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const search = searchParams.get('search')

    // Construction des filtres
    const where: {
      tenantId: string
      employeeId?: string
      status?: BulletinStatus
      year?: number
      month?: number
      employee?: {
        OR: Array<{
          firstName?: { contains: string; mode: 'insensitive' }
          lastName?: { contains: string; mode: 'insensitive' }
          employeeCode?: { contains: string; mode: 'insensitive' }
        }>
      }
    } = {
      tenantId: session.user.tenantId
    }

    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status as BulletinStatus
    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)

    // Recherche par nom d'employé
    if (search) {
      where.employee = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeCode: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    // Récupération des bulletins avec pagination
    const [bulletins, total] = await Promise.all([
      prisma.bulletinPaie.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeCode: true,
              position: true
            }
          }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit
      }),
      prisma.bulletinPaie.count({ where })
    ])

    // Formatage des résultats
    const bulletinsFormatted = bulletins.map(bulletin => ({
      id: bulletin.id,
      periode: bulletin.periode,
      status: bulletin.status,
      employee: {
        id: bulletin.employeeId,
        name: `${bulletin.employee.firstName} ${bulletin.employee.lastName}`,
        code: bulletin.employee.employeeCode,
        position: bulletin.employee.position
      },
      montants: {
        grossSalary: Number(bulletin.grossSalary),
        netSalary: Number(bulletin.netSalary),
        totalDeductions: Number(bulletin.totalDeductions),
        totalChargesPatronales: Number(bulletin.totalChargesPatronales)
      },
      pdfPath: bulletin.pdfPath,
      createdAt: bulletin.createdAt,
      updatedAt: bulletin.updatedAt
    }))

    return NextResponse.json({
      success: true,
      bulletins: bulletinsFormatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}