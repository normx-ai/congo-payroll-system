// Helpers pour API Payroll - NORM PAIE
// Fichier: 120 lignes

import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { prisma } from '../prisma'
import { BulletinPaie } from './types'

export interface EmployeeData {
  id: string
  firstName: string
  lastName: string
  baseSalary: number | { toNumber(): number }
}

export class PayrollApiHelpers {

  /**
   * Vérifie l'authentification et retourne la session
   */
  static async verifyAuth() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      throw new Error('Non autorisé')
    }
    return session
  }

  /**
   * Récupère un employé avec validation tenant
   */
  static async getEmployeeWithTenant(employeeId: string, tenantId: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId,
        isActive: true
      },
      include: {
        tenant: true,
        department: true
      }
    })

    if (!employee) {
      throw new Error('Employé non trouvé')
    }

    return employee
  }

  /**
   * Calcule l'ancienneté d'un employé
   */
  static calculateAnciennete(hireDate: Date, periodeDate: Date) {
    const ancienneteMs = periodeDate.getTime() - hireDate.getTime()
    const ancienneteAnnees = Math.floor(ancienneteMs / (365.25 * 24 * 60 * 60 * 1000))
    const ancienneteMois = Math.floor(ancienneteMs / (30.44 * 24 * 60 * 60 * 1000))

    return {
      annees: Math.max(0, ancienneteAnnees),
      mois: Math.max(0, ancienneteMois)
    }
  }

  /**
   * Valide le format de période YYYY-MM
   */
  static validatePeriode(periode: string): boolean {
    return /^\d{4}-\d{2}$/.test(periode)
  }

  /**
   * Sauvegarde un bulletin en base
   */
  static async savePayslip(bulletin: BulletinPaie, employee: EmployeeData) {
    const [year, month] = bulletin.periode.split('-')

    return await prisma.payslip.create({
      data: {
        id: `${bulletin.employeeId}-${bulletin.periode}`,
        employeeId: employee.id,
        periodMonth: parseInt(month),
        periodYear: parseInt(year),
        baseSalary: typeof employee.baseSalary === 'number' ? employee.baseSalary : employee.baseSalary.toNumber(),
        grossSalary: bulletin.gains.totalBrutFiscal,
        netSalary: bulletin.netAPayer,
        taxDeduction: bulletin.retenues.cotisationsEmploye.irpp,
        cnssDeduction: bulletin.retenues.cotisationsEmploye.cnss,
        otherDeductions: bulletin.retenues.autresRetenues.total,
        transportAllowance: 0,
        housingAllowance: 0,
        otherAllowances: 0,
        isGenerated: true,
        isSent: false,
        notes: `Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}`
      }
    })
  }

  /**
   * Formate la réponse API pour un bulletin
   */
  static formatBulletinResponse(bulletin: BulletinPaie, employee: EmployeeData, payslip: { id: string }) {
    return {
      success: true,
      bulletin: {
        id: payslip.id,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        periode: bulletin.periode,
        montants: {
          brutSocial: bulletin.gains.totalBrutSocial,
          brutFiscal: bulletin.gains.totalBrutFiscal,
          cotisationsEmploye: bulletin.retenues.cotisationsEmploye.total,
          cotisationsEmployeur: bulletin.chargesEmployeur.total,
          netAPayer: bulletin.netAPayer,
          coutTotalEmployeur: bulletin.coutTotalEmployeur
        },
        rubriques: {
          gains: bulletin.gains.rubriques.length,
          retenues: bulletin.retenues.autresRetenues.rubriques.length
        }
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Gère les erreurs API communes
   */
  static handleApiError(error: Error | string | null) {
    console.error('Erreur API Payroll:', error)

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'

    if (errorMessage === 'Non autorisé') {
      return { error: 'Non autorisé', status: 401 }
    }

    if (errorMessage === 'Employé non trouvé') {
      return { error: 'Employé non trouvé', status: 404 }
    }

    return {
      error: 'Erreur interne du serveur',
      details: errorMessage,
      status: 500
    }
  }
}