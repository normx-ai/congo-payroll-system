/**
 * Service principal pour la liste des bulletins de paie
 * Orchestrateur utilisant les services spécialisés
 */

import { PayslipQueryService, PayslipQueryRequest } from './payslip-query-service'
import { PayslipFormatter } from './payslip-formatter'
import { PayslipBatchService } from './payslip-batch-service'
import type { PayslipBatchRequest, PayslipBatchResult } from './payslip-batch-service'
import { Bulletin, PayslipStats } from '@/types/ui'

export interface PayslipListRequest {
  tenantId: string
  periode?: string
  employeId?: string
  page?: number
  limit?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FiltersInfo {
  periode: string | null
  employeId: string | null
}

export interface PayslipListResult {
  success: boolean
  bulletins?: Bulletin[]
  stats?: PayslipStats
  pagination?: PaginationInfo
  filters?: FiltersInfo
  error?: string
}

export class PayslipListService {
  /**
   * Récupère la liste des bulletins avec pagination et filtres
   */
  static async getPayslipList(request: PayslipListRequest): Promise<PayslipListResult> {
    try {
      const page = request.page || 1
      const limit = request.limit || 20

      // Validation pagination
      const paginationError = PayslipQueryService.validatePagination(page, limit)
      if (paginationError) {
        return { success: false, error: paginationError }
      }

      // Préparer la requête pour le service de query
      const queryRequest: PayslipQueryRequest = {
        tenantId: request.tenantId,
        periode: request.periode,
        employeId: request.employeId,
        page,
        limit
      }

      // Récupérer les données
      const { total, payslips } = await PayslipQueryService.getPayslipsWithTotal(queryRequest)

      // Convertir les données Prisma vers l'interface Bulletin
      const bulletinsFormatted = payslips.map(payslip => ({
        id: payslip.id,
        employee: {
          id: payslip.employee.id,
          matricule: payslip.employee.employeeCode,
          nom: payslip.employee.lastName,
          prenom: payslip.employee.firstName,
          poste: payslip.employee.position,
          department: payslip.employee.department?.name || 'N/A'
        },
        periode: {
          year: payslip.year || new Date().getFullYear(),
          month: payslip.month || new Date().getMonth() + 1,
          libelle: `${PayslipFormatter.getMonthName(payslip.month || new Date().getMonth() + 1)} ${payslip.year || new Date().getFullYear()}`
        },
        montants: {
          salaireBase: Number(payslip.employee.baseSalary || 0),
          brut: Number(payslip.grossSalary || 0),
          cotisations: Number(payslip.totalDeductions || 0),
          retenues: Number(payslip.totalChargesPatronales || 0),
          net: Number(payslip.netSalary || 0)
        },
        status: {
          genere: Boolean(payslip.status === 'validated'),
          envoye: Boolean(payslip.status === 'archived'),
          dateCreation: (payslip.createdAt || new Date()).toISOString()
        },
        notes: ''
      }))

      // Formater la réponse
      const response = PayslipFormatter.formatResponse(
        bulletinsFormatted,
        total,
        page,
        limit,
        {
          periode: request.periode,
          employeId: request.employeId
        }
      )

      return response

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  /**
   * Prépare une génération en lot de bulletins
   */
  static async prepareBatchGeneration(request: PayslipBatchRequest): Promise<PayslipBatchResult> {
    return PayslipBatchService.prepareBatchGeneration(request)
  }
}

// Réexporter les interfaces pour compatibilité
export type { PayslipBatchRequest, PayslipBatchResult } from './payslip-batch-service'