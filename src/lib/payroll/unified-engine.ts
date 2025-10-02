/**
 * Moteur de paie unifié - Version consolidée
 * Fichier: <150 lignes
 */

import { UnifiedEmployee, EmployeeAdapter } from './compatibility-adapter'
import { EmployeeConverter, PayrollConversionOptions } from './employee-converter'
import { PayrollEngine } from './engine'
import { BulletinPaie } from './types'
import { Employee as TypesEmployee } from '../../types/employee'
import { Employee as LegacyEmployee } from './legacy-adapter'

export type SupportedEmployeeInput = UnifiedEmployee | TypesEmployee | LegacyEmployee

export interface UnifiedPayrollOptions extends PayrollConversionOptions {
  periode: string
  autoConvert?: boolean
}

/**
 * Moteur unifié acceptant tous types d'Employee
 */
export class UnifiedPayrollEngine {

  /**
   * Calcule bulletin depuis n'importe quel type Employee (async)
   */
  static async calculateBulletin(
    employee: SupportedEmployeeInput,
    options: UnifiedPayrollOptions
  ): Promise<BulletinPaie> {

    // 1. Normalisation de l'employé
    const unifiedEmployee = EmployeeAdapter.normalize(employee)

    // 2. Validation
    if (!EmployeeAdapter.isValidEmployee(unifiedEmployee)) {
      throw new Error(`Employé invalide: ${JSON.stringify(employee)}`)
    }

    // 3. Conversion vers données de paie
    const employeePaieData = EmployeeConverter.toEmployeePaieData(
      unifiedEmployee,
      options.periode,
      options
    )

    // 4. Calcul avec moteur refactorisé (async)
    return await PayrollEngine.calculateBulletin(employeePaieData)
  }

  /**
   * Calcul batch pour plusieurs employés
   */
  static calculateBulletinsBatch(
    employees: SupportedEmployeeInput[],
    options: UnifiedPayrollOptions
  ) {
    const results: Array<{ success: boolean; data?: BulletinPaie; error?: string; employeeId?: string }> = []

    for (const employee of employees) {
      try {
        const bulletin = this.calculateBulletin(employee, options)
        results.push({
          success: true,
          data: bulletin,
          employeeId: 'id' in employee ? employee.id : ''
        })
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          employeeId: 'id' in employee ? employee.id : ''
        })
      }
    }

    return {
      total: employees.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }
  }

  /**
   * Vérifie la compatibilité d'un employé
   */
  static checkCompatibility(employee: SupportedEmployeeInput) {
    try {
      const unified = EmployeeAdapter.normalize(employee)
      const isValid = EmployeeAdapter.isValidEmployee(unified)

      const missingFields = []
      if (!unified.id) missingFields.push('id')
      if (!unified.firstName) missingFields.push('firstName')
      if (!unified.lastName) missingFields.push('lastName')
      if (!unified.employeeCode) missingFields.push('employeeCode')
      if (!unified.position) missingFields.push('position')
      if (!unified.baseSalary || unified.baseSalary <= 0) missingFields.push('baseSalary')

      return {
        compatible: isValid,
        missingFields,
        normalized: unified
      }
    } catch (error) {
      return {
        compatible: false,
        error: error instanceof Error ? error.message : 'Erreur de normalisation'
      }
    }
  }

  /**
   * Test de compatibilité avec différents moteurs
   */
  static async testEngineCompatibility(
    employee: SupportedEmployeeInput,
    periode: string
  ) {
    const results: Record<string, { success: boolean; netAPayer?: number; error?: string }> = {}

    // Test moteur unifié
    try {
      const unified = this.calculateBulletin(employee, { periode })
      results.unified = { success: true, netAPayer: unified.netAPayer }
    } catch (error) {
      results.unified = { success: false, error: (error as Error).message }
    }

    // Test moteur legacy si applicable
    if ('salaireBase' in employee) {
      try {
        const legacy = PayrollEngine.calculateBulletin({
          employeeId: 'id' in employee ? employee.id : '',
          periode,
          baseSalary: 'salaireBase' in employee ? (employee as LegacyEmployee).salaireBase || 0 : 0,
          ancienneteAnnees: 0,
          ancienneteMois: 0,
          joursTravailles: 30,
          rubriquesSaisies: []
        })
        results.legacy = { success: true, netAPayer: legacy.netAPayer }
      } catch (error) {
        results.legacy = { success: false, error: (error as Error).message }
      }
    }

    return results
  }
}