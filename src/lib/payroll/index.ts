/**
 * Export centralisé - Moteur de paie unifié
 * Point d'entrée unique pour toutes les fonctionnalités de paie
 * Fichier: <150 lignes
 */

// === INTERFACES UNIFIÉES ===
export type {
  UnifiedEmployee
} from './compatibility-adapter'

export type {
  PayrollConversionOptions
} from './employee-converter'

// === TYPES D'ENTRÉE SUPPORTÉS ===
import { Employee as TypesEmployee } from '../../types/employee'
import { Employee as LegacyEmployee, LegacyEmployeeInput } from './legacy-adapter'
import { UnifiedEmployee } from './compatibility-adapter'
import { PayrollConversionOptions } from './employee-converter'
import { BulletinPaie, EmployeePaieData } from './types'
import { UnifiedPayrollEngine } from './unified-engine'
import { EmployeeAdapter } from './compatibility-adapter'
import { PayrollEngine } from './engine'

export type SupportedEmployee = UnifiedEmployee | TypesEmployee | LegacyEmployee

export type {
  UnifiedPayrollOptions
} from './unified-engine'

export type {
  BulletinPaie,
  RubriqueEmploye,
  RubriqueType,
  ModeCalcul,
  CotisationsEmploye,
  ChargesEmployeur,
  EmployeePaieData
} from './types'

export type {
  HeuresSupDetails
} from './heures-supplementaires'

// === ADAPTATEURS ===
export {
  EmployeeAdapter
} from './compatibility-adapter'

export {
  EmployeeConverter
} from './employee-converter'

// === MOTEURS ===
export {
  PayrollEngine
} from './engine'

export {
  UnifiedPayrollEngine
} from './unified-engine'


// === FONCTIONS DE COMMODITÉ ===

/**
 * Fonction principale - Calcul de bulletin unifié (async)
 */
export async function calculatePayroll(
  employee: SupportedEmployee,
  periode: string,
  options: Partial<PayrollConversionOptions> = {}
): Promise<BulletinPaie> {
  return await UnifiedPayrollEngine.calculateBulletin(employee, {
    periode,
    ...options
  })
}

/**
 * Calcul batch sécurisé
 */
export function calculatePayrollBatch(
  employees: SupportedEmployee[],
  periode: string,
  options: Partial<PayrollConversionOptions> = {}
) {
  return UnifiedPayrollEngine.calculateBulletinsBatch(employees, {
    periode,
    ...options
  })
}

/**
 * Vérification de compatibilité rapide
 */
export function checkEmployeeCompatibility(employee: SupportedEmployee) {
  return UnifiedPayrollEngine.checkCompatibility(employee)
}

/**
 * Normalisation rapide d'un employé
 */
export function normalizeEmployee(employee: SupportedEmployee): UnifiedEmployee {
  return EmployeeAdapter.normalize(employee)
}

/**
 * Validation rapide
 */
export function isValidEmployee(employee: SupportedEmployee): boolean {
  return EmployeeAdapter.isValidEmployee(employee)
}

// === UTILITAIRES ===

// === ADAPTATEURS LEGACY ===
export {
  PayrollCalculator,
  type PayrollCalculation,
  type Employee as LegacyEmployee
} from './legacy-adapter'

// === FONCTIONS DE COMMODITÉ ===




// === CONSTANTES ===
export const PAYROLL_VERSION = '2.0.0-unified'
export const SUPPORTED_EMPLOYEE_TYPES = [
  'types/employee.ts',
  'payroll-calculator',
  'generic'
] as const

// === MIGRATION HELPERS ===

/**
 * Guide de migration depuis l'ancien moteur
 */
export const MIGRATION_GUIDE = {
  fromPayrollEngine: {
    old: 'PayrollEngine.calculateBulletin(employeePaieData)',
    new: 'calculatePayroll(employee, periode, options)'
  },
  fromPayrollCalculator: {
    old: 'PayrollCalculator.calculatePayroll(employee)',
    new: 'calculatePayroll(employee, periode)'
  },
  compatibilityCheck: 'checkEmployeeCompatibility(employee)'
} as const

/**
 * Fonctions de migration pour transition en douceur
 */
export class MigrationHelper {
  /**
   * Migration depuis PayrollCalculator
   */
  static fromPayrollCalculator(employee: LegacyEmployeeInput) {
    const periode = new Date().toISOString().slice(0, 7) // YYYY-MM
    return calculatePayroll(employee, periode)
  }

  /**
   * Migration depuis ancien PayrollEngine
   */
  static fromPayrollEngine(employeePaieData: EmployeePaieData) {
    return PayrollEngine.calculateBulletin(employeePaieData)
  }

  /**
   * Test de migration
   */
  static async testMigration(employee: SupportedEmployee) {
    const compatibility = checkEmployeeCompatibility(employee)
    const engines = await UnifiedPayrollEngine.testEngineCompatibility(employee, '2024-09')

    return {
      compatibility,
      engines,
      recommendation: compatibility.compatible ? 'Utiliser moteur unifié' : 'Corriger données puis migrer'
    }
  }
}