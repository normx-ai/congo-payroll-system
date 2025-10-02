/**
 * Convertisseur Employee vers EmployeePaieData
 * Fichier: <150 lignes
 */

import { UnifiedEmployee } from './compatibility-adapter'
import { EmployeePaieData } from './types'

export interface PayrollConversionOptions {
  tenantId?: string
  quotientFamilial?: number
  joursTravailles?: number
  rubriquesSaisies?: Array<{
    code: string
    montant: number
    nbHeures?: number
  }>
  chargesDeductibles?: number
  statutEmploye?: 'actif' | 'demissionnaire' | 'licencie'
}

/**
 * Convertisseur vers données de paie
 */
export class EmployeeConverter {

  /**
   * Convertit vers EmployeePaieData pour le moteur de paie
   */
  static toEmployeePaieData(
    employee: UnifiedEmployee,
    periode: string,
    options: PayrollConversionOptions = {}
  ): EmployeePaieData {

    const anciennete = this.calculateAnciennete(employee.hireDate, periode)

    return {
      employeeId: employee.id,
      tenantId: options.tenantId || employee.tenantId || '',
      periode,
      baseSalary: employee.baseSalary,
      ancienneteAnnees: anciennete.annees,
      ancienneteMois: anciennete.mois,
      joursTravailles: options.joursTravailles || 30,
      rubriquesSaisies: options.rubriquesSaisies || [],
      chargesDeductibles: options.chargesDeductibles,
      quotientFamilial: options.quotientFamilial,
      statutEmploye: options.statutEmploye || 'actif',
      maritalStatus: employee.maritalStatus,
      childrenCount: employee.childrenCount
    }
  }

  /**
   * Calcule ancienneté depuis date d'embauche
   */
  private static calculateAnciennete(hireDate?: Date | string, periode?: string): { annees: number; mois: number } {
    if (!hireDate) return { annees: 0, mois: 0 }

    const hire = typeof hireDate === 'string' ? new Date(hireDate) : hireDate

    // Utiliser la fin de la période comme date de référence
    let refDate: Date
    if (periode) {
      const [year, month] = periode.split('-').map(Number)
      refDate = new Date(year, month, 0) // Dernier jour du mois
    } else {
      refDate = new Date()
    }

    const diffMs = refDate.getTime() - hire.getTime()
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))

    return {
      annees: Math.floor(diffMonths / 12),
      mois: diffMonths
    }
  }

  /**
   * Extraction des rubriques depuis charges fixes
   */
  static extractRubriquesFromCharges(employee: UnifiedEmployee): Array<{ code: string; montant: number }> {
    if (!employee.chargesFixes || employee.chargesFixes.length === 0) {
      return []
    }

    return employee.chargesFixes.map(charge => ({
      code: charge.rubriqueCode || 'CHARGE',
      montant: charge.amount
    }))
  }

  /**
   * Calcul automatique des options selon l'employé
   */
  static deriveOptions(employee: UnifiedEmployee, periode: string): PayrollConversionOptions {
    const [year, month] = periode.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    // Si embauché en cours de mois
    let joursTravailles = daysInMonth
    if (employee.hireDate) {
      const hire = typeof employee.hireDate === 'string' ? new Date(employee.hireDate) : employee.hireDate
      if (hire.getFullYear() === year && hire.getMonth() + 1 === month) {
        joursTravailles = daysInMonth - hire.getDate() + 1
      }
    }

    return {
      joursTravailles,
      rubriquesSaisies: this.extractRubriquesFromCharges(employee),
      chargesDeductibles: 0,
      statutEmploye: employee.isActive === false ? 'licencie' : 'actif'
    }
  }

  /**
   * Conversion complète avec options auto
   */
  static toEmployeePaieDataAuto(employee: UnifiedEmployee, periode: string): EmployeePaieData {
    const options = this.deriveOptions(employee, periode)
    return this.toEmployeePaieData(employee, periode, options)
  }
}