import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireExercice } from '@/lib/exercice-guard'
import { BulletinGenerator } from '@/lib/bulletin-generator'
import { BulletinStorageService } from '@/lib/bulletin-storage'
import { calculatePayroll } from '@/lib/payroll'
import { convertToLegacy } from '@/lib/payroll/legacy-converter'
import { handleCatchError } from '@/lib/error-handler'
import { BulletinData } from '@/lib/bulletin-types'

// Force Node.js runtime pour supporter react-dom/server
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const exerciceGuard = await requireExercice(session.user.tenantId)
    if (exerciceGuard) return exerciceGuard

    const { periode, employeeIds = [], departmentId } = await req.json()

    if (!periode) {
      return NextResponse.json({ error: 'Période requise' }, { status: 400 })
    }

    if (!/^\d{4}-\d{2}$/.test(periode)) {
      return NextResponse.json(
        { error: 'Format période invalide (YYYY-MM)' },
        { status: 400 }
      )
    }

    // Construction du filtre pour les employés
    const employeeWhere: {
      tenantId: string
      isActive: boolean
      id?: { in: string[] }
      departmentId?: string
    } = {
      tenantId: session.user.tenantId,
      isActive: true
    }

    if (employeeIds.length > 0) {
      employeeWhere.id = { in: employeeIds }
    }

    if (departmentId) {
      employeeWhere.departmentId = departmentId
    }

    // Récupération des employés
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      include: { tenant: true, department: true }
    })

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'Aucun employé trouvé' },
        { status: 404 }
      )
    }

    const results = []
    const errors = []
    const [month, year] = [periode.split('-')[1], periode.split('-')[0]]

    // Traitement par lot des bulletins
    for (const employee of employees) {
      try {
        // Calculer bulletin
        const employeeForPayroll = {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeCode: employee.employeeCode,
          position: employee.position,
          baseSalary: Number(employee.baseSalary),
          hireDate: employee.hireDate,
          childrenCount: Number(employee.childrenCount ?? 0),
          maritalStatus: employee.maritalStatus ?? undefined,
          isActive: employee.isActive ?? true
        }

        const bulletinPaie = await calculatePayroll(employeeForPayroll, periode, {
          joursTravailles: 30
        })

        // Convertir BulletinPaie vers PayrollCalculation pour compatibilité
        // Utiliser le dernier jour du mois de la période comme date de référence
        const referenceDate = new Date(parseInt(year), parseInt(month), 0) // Dernier jour du mois
        const calculation = convertToLegacy(employeeForPayroll, bulletinPaie, referenceDate)

        // Données bulletin
        const bulletinData: BulletinData = {
          calculation,
          month,
          year,
          employeeId: employee.id,
          company: {
            name: employee.tenant.companyName || 'Entreprise',
            address: employee.tenant.companyAddress || '',
            city: '', // Éviter la duplication de l'adresse
            niu: employee.tenant.nui || undefined,
            logoUrl: employee.tenant.logoUrl || undefined
          }
        }

        // Générer et sauvegarder
        const result = await BulletinGenerator.generateBulletin(bulletinData)
        const { bulletinId } = await BulletinStorageService.saveBulletin(bulletinData, result)

        results.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          bulletinId,
          success: true
        })

      } catch (error) {
        console.error(`Erreur bulletin ${employee.id}:`, error)
        errors.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        })
      }
    }

    return NextResponse.json({
      success: true,
      periode,
      processed: employees.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    })

  } catch (error) {
    return handleCatchError(error)
  }
}