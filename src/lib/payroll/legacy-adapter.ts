/**
 * Adaptateur legacy pour remplacer PayrollCalculator
 * Fichier: <150 lignes
 */

import { calculatePayroll, BulletinPaie } from './index'
import { LegacyEmployeeInput, PayrollCalculation } from './legacy-types'
import { convertToLegacy } from './legacy-converter'
import { createFallbackCalculation, formatCurrency } from './legacy-fallback'

/**
 * Remplace PayrollCalculator avec le moteur unifié
 */
export class PayrollCalculator {

  /**
   * Calcule la paie - Interface legacy avec moteur unifié
   */
  static async calculatePayroll(employee: LegacyEmployeeInput): Promise<PayrollCalculation> {
    // Période par défaut (mois actuel)
    const now = new Date()
    const periode = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`

    try {
      // Utiliser le moteur unifié
      const bulletin = await calculatePayroll(employee, periode)

      // Convertir vers l'interface legacy
      return this.convertToLegacy(employee, bulletin)
    } catch (error) {
      console.error('Erreur calcul PayrollCalculator legacy:', error)
      // Fallback avec données minimales
      return this.createFallbackCalculation(employee)
    }
  }

  /**
   * Convertit BulletinPaie vers PayrollCalculation
   */
  private static convertToLegacy(employee: LegacyEmployeeInput, bulletin: BulletinPaie): PayrollCalculation {
    return convertToLegacy(employee, bulletin)
  }




  /**
   * Calcul fallback en cas d'erreur
   */
  private static createFallbackCalculation(employee: LegacyEmployeeInput): PayrollCalculation {
    return createFallbackCalculation(employee)
  }

  /**
   * Formatage monétaire - Conservé pour compatibilité
   */
  public static formatCurrency(amount: number): string {
    return formatCurrency(amount)
  }
}

// Re-export des types legacy
export type { PayrollCalculation, Employee, LegacyEmployeeInput } from './legacy-types'