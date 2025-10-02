/**
 * Interface Employee unifiée - Compatibilité entre tous les modules
 * Fichier: <150 lignes
 */

// Imports des types existants
import { Employee as TypesEmployee, EmployeeChargeFixe } from '../../types/employee'

// Interface pour compatibilité avec le calculateur de paie
export interface CalculatorEmployee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
  anciennete?: number
  categorieProfessionnelle?: number
  echelon?: number
  conventionCollective?: string
}

// Interface unifiée
export interface UnifiedEmployee {
  // Champs essentiels
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  baseSalary: number

  // Champs optionnels (compatibilité)
  tenantId?: string
  email?: string
  phone?: string
  gender?: string
  hireDate?: Date | string
  cnssNumber?: string
  nui?: string
  maritalStatus?: string
  childrenCount?: number
  contractType?: string
  salaryCategory?: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  department?: { id: string; name: string } | null
  chargesFixes?: EmployeeChargeFixe[]
  salaireBase?: number
  anciennete?: number
  categorieProfessionnelle?: number
  echelon?: number
  conventionCollective?: string
}

/**
 * Type union pour tous les variants d'employés
 */
type EmployeeVariant = TypesEmployee | CalculatorEmployee | UnifiedEmployee

/**
 * Type guards pour identifier les différents types d'employés
 */
function isTypesEmployee(employee: EmployeeVariant): employee is TypesEmployee {
  return 'tenantId' in employee && employee.tenantId !== undefined
}

function isCalculatorEmployee(employee: EmployeeVariant): employee is CalculatorEmployee {
  return 'salaireBase' in employee && employee.salaireBase !== undefined
}

function isUnifiedEmployee(employee: EmployeeVariant): employee is UnifiedEmployee {
  return 'baseSalary' in employee && typeof employee.baseSalary === 'number'
}

/**
 * Adaptateur principal pour conversion d'interfaces
 */
export class EmployeeAdapter {

  /**
   * Depuis types/employee.ts
   */
  static fromTypesEmployee(employee: TypesEmployee): UnifiedEmployee {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      baseSalary: employee.baseSalary,
      tenantId: employee.tenantId,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender,
      hireDate: employee.hireDate,
      cnssNumber: employee.cnssNumber,
      nui: employee.nui,
      maritalStatus: employee.maritalStatus,
      childrenCount: employee.childrenCount,
      contractType: employee.contractType,
      salaryCategory: employee.salaryCategory,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      department: employee.department,
      chargesFixes: employee.chargesFixes,
      salaireBase: employee.baseSalary
    }
  }

  /**
   * Depuis payroll-calculator
   */
  static fromCalculatorEmployee(employee: CalculatorEmployee): UnifiedEmployee {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      baseSalary: employee.salaireBase || 150000,
      salaireBase: employee.salaireBase,
      anciennete: employee.anciennete,
      categorieProfessionnelle: employee.categorieProfessionnelle,
      echelon: employee.echelon,
      conventionCollective: employee.conventionCollective
    }
  }

  /**
   * Validation interface minimale
   */
  static isValidEmployee(obj: UnifiedEmployee | TypesEmployee | CalculatorEmployee): obj is UnifiedEmployee {
    return obj &&
           typeof obj.id === 'string' &&
           typeof obj.firstName === 'string' &&
           typeof obj.lastName === 'string' &&
           typeof obj.employeeCode === 'string' &&
           typeof obj.position === 'string' &&
           typeof (obj as { baseSalary?: number }).baseSalary === 'number' &&
           ((obj as { baseSalary?: number }).baseSalary || 0) > 0
  }

  /**
   * Auto-détection et normalisation
   */
  static normalize(employee: EmployeeVariant): UnifiedEmployee {
    if (isTypesEmployee(employee)) {
      return this.fromTypesEmployee(employee)
    } else if (isCalculatorEmployee(employee)) {
      return this.fromCalculatorEmployee(employee)
    } else if (isUnifiedEmployee(employee)) {
      return employee
    } else {
      // Cas par défaut - ne devrait pas arriver
      throw new Error(`Type d'employé non reconnu: ${JSON.stringify(employee)}`)
    }
  }
}