/**
 * Calculs fallback pour l'adaptateur legacy
 */

import { LegacyEmployeeInput, PayrollCalculation } from './legacy-types'

/**
 * Récupère le salaire selon la convention collective
 */
export function extractSalaireFromEmployee(employee: LegacyEmployeeInput): number {
  // Type guard pour UnifiedEmployee
  if ('baseSalary' in employee && typeof employee.baseSalary === 'number') {
    return employee.baseSalary
  }
  // Type guard pour TypesEmployee
  if ('baseSalary' in employee && typeof employee.baseSalary === 'number') {
    return employee.baseSalary
  }
  // Pas de salaire par défaut - doit être défini selon la convention
  throw new Error('Salaire non défini. Le salaire doit être calculé selon la convention collective, catégorie professionnelle et échelon.')
}

/**
 * Calcul fallback en cas d'erreur
 */
export function createFallbackCalculation(employee: LegacyEmployeeInput): PayrollCalculation {
  const salaireBase = extractSalaireFromEmployee(employee)
  const totalRetenues = salaireBase * 0.15 // 15% estimation
  const salaireNet = salaireBase - totalRetenues

  return {
    employeeId: employee.id || '',
    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`,
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    employeeCode: 'employeeCode' in employee ? employee.employeeCode : '',
    position: 'position' in employee ? employee.position : '',
    salaireBase,
    totalGains: salaireBase,
    totalRetenues,
    totalAvantages: 0,
    salaireNet,
    cotisationsEmployeur: salaireBase * 0.2, // 20% estimation
    rubriques: {
      gains: [
        { code: '0100', designation: 'Salaire catégoriel', montant: salaireBase }
      ],
      retenues: [
        { code: 'CNSS', designation: 'CNSS', montant: salaireBase * 0.04 },
        { code: 'CAMU', designation: 'CAMU', montant: salaireBase * 0.02 },
        { code: 'IRPP', designation: 'IRPP', montant: salaireBase * 0.09 }
      ]
    },
    details: {
      gains: [
        { code: '0100', libelle: 'Salaire catégoriel', montant: salaireBase }
      ],
      retenues: [
        { code: 'CNSS', libelle: 'CNSS', montant: salaireBase * 0.04 },
        { code: 'CAMU', libelle: 'CAMU', montant: salaireBase * 0.02 },
        { code: 'IRPP', libelle: 'IRPP', montant: salaireBase * 0.09 }
      ],
      avantages: []
    }
  }
}

/**
 * Formatage monétaire - Conservé pour compatibilité
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CG', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount)
}