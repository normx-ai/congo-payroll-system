import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleCatchError } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    // Construction des filtres
    const where: {
      tenantId: string
      year?: number
      month?: number
    } = {
      tenantId: session.user.tenantId
    }

    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)

    // Récupération des états de charges
    const etatsCharges = await prisma.etatChargesMensuel.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    const formattedStates = etatsCharges.map(etat => ({
      id: etat.id,
      periode: etat.periode,
      totalEmployees: etat.totalEmployees,
      montants: {
        totalGrossSalary: Number(etat.totalGrossSalary),
        totalNetSalary: Number(etat.totalNetSalary),
        totalChargesPatronales: Number(etat.totalChargesPatronales),
        totalChargesSalariales: Number(etat.totalChargesSalariales)
      },
      pdfPath: etat.pdfPath,
      createdAt: etat.createdAt
    }))

    return NextResponse.json({
      success: true,
      etatsCharges: formattedStates
    })

  } catch (error) {
    return handleCatchError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { periode } = await req.json()

    if (!periode || !/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json(
        { error: 'Format période invalide (YYYY-MM)' },
        { status: 400 }
      )
    }

    const [year, month] = periode.split('-').map(Number)

    // Récupérer tous les bulletins du mois
    const bulletins = await prisma.bulletinPaie.findMany({
      where: {
        tenantId: session.user.tenantId,
        year,
        month,
        status: 'validated'
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            position: true
          }
        }
      }
    })

    if (bulletins.length === 0) {
      return NextResponse.json(
        { error: 'Aucun bulletin validé pour cette période' },
        { status: 404 }
      )
    }

    // Calculer les totaux
    const totals = bulletins.reduce((acc, bulletin) => ({
      totalGrossSalary: acc.totalGrossSalary + Number(bulletin.grossSalary),
      totalNetSalary: acc.totalNetSalary + Number(bulletin.netSalary),
      totalChargesPatronales: acc.totalChargesPatronales + Number(bulletin.totalChargesPatronales),
      totalChargesSalariales: acc.totalChargesSalariales + Number(bulletin.totalDeductions)
    }), {
      totalGrossSalary: 0,
      totalNetSalary: 0,
      totalChargesPatronales: 0,
      totalChargesSalariales: 0
    })

    // Créer ou mettre à jour l'état de charges
    const etatCharges = await prisma.etatChargesMensuel.upsert({
      where: {
        tenantId_periode: {
          tenantId: session.user.tenantId,
          periode
        }
      },
      update: {
        totalEmployees: bulletins.length,
        ...totals,
        dataJson: { bulletins: bulletins.map(b => ({
          employeeId: b.employeeId,
          employeeName: `${b.employee.firstName} ${b.employee.lastName}`,
          grossSalary: Number(b.grossSalary),
          netSalary: Number(b.netSalary)
        })) }
      },
      create: {
        tenantId: session.user.tenantId,
        month,
        year,
        periode,
        totalEmployees: bulletins.length,
        ...totals,
        dataJson: { bulletins: bulletins.map(b => ({
          employeeId: b.employeeId,
          employeeName: `${b.employee.firstName} ${b.employee.lastName}`,
          grossSalary: Number(b.grossSalary),
          netSalary: Number(b.netSalary)
        })) }
      }
    })

    return NextResponse.json({
      success: true,
      etatCharges: {
        id: etatCharges.id,
        periode,
        totalEmployees: etatCharges.totalEmployees,
        montants: totals
      }
    })

  } catch (error) {
    return handleCatchError(error)
  }
}