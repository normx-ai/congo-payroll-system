/**
 * Service de génération en lot des bulletins de paie
 * Gère la validation et préparation des lots
 */

import { prisma } from '@/lib/prisma'

export interface PayslipBatchRequest {
  tenantId: string
  periode: string
  employeIds: string[]
}

export interface PayslipBatchResult {
  success: boolean
  batch?: {
    id: string
    periode: string
    employes: number
    status: string
  }
  error?: string
}

export class PayslipBatchService {
  /**
   * Valide le format de période
   */
  static validatePeriode(periode: string): boolean {
    return /^\d{4}-\d{2}$/.test(periode)
  }

  /**
   * Valide les paramètres de base pour un lot
   */
  static validateBatchRequest(request: PayslipBatchRequest): string | null {
    if (!request.periode || !Array.isArray(request.employeIds) || request.employeIds.length === 0) {
      return 'periode et employeIds (array) requis'
    }

    if (!this.validatePeriode(request.periode)) {
      return 'Format période invalide (attendu: YYYY-MM)'
    }

    if (request.employeIds.length > 50) {
      return 'Maximum 50 employés par lot'
    }

    return null
  }

  /**
   * Valide les employés pour génération en lot
   */
  static async validateEmployeesForBatch(employeIds: string[], tenantId: string) {
    return await prisma.employee.findMany({
      where: {
        id: { in: employeIds },
        tenantId,
        isActive: true
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true
      }
    })
  }

  /**
   * Génère un ID unique pour le lot
   */
  static generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Prépare une génération en lot de bulletins
   */
  static async prepareBatchGeneration(request: PayslipBatchRequest): Promise<PayslipBatchResult> {
    try {
      // Validation de base
      const validationError = this.validateBatchRequest(request)
      if (validationError) {
        return { success: false, error: validationError }
      }

      // Vérifier les employés
      const validEmployees = await this.validateEmployeesForBatch(request.employeIds, request.tenantId)

      if (validEmployees.length !== request.employeIds.length) {
        return { success: false, error: 'Certains employés sont invalides ou inactifs' }
      }

      // Générer l'ID de lot
      const batchId = this.generateBatchId()

      return {
        success: true,
        batch: {
          id: batchId,
          periode: request.periode,
          employes: validEmployees.length,
          status: 'pending'
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }
}