/**
 * Service de requêtes pour les bulletins de paie
 * Gère les filtres, validation et récupération des données
 */

import { prisma } from '@/lib/prisma'

export interface PayslipFilters {
  tenantId: string
  employee: {
    isActive: boolean
  }
  year?: number
  month?: number
  employeeId?: string
}

export interface PayslipQueryRequest {
  tenantId: string
  periode?: string
  employeId?: string
  page: number
  limit: number
}

export class PayslipQueryService {
  /**
   * Valide les paramètres de pagination
   */
  static validatePagination(page: number, limit: number): string | null {
    if (page < 1 || limit < 1 || limit > 100) {
      return 'Paramètres de pagination invalides'
    }
    return null
  }

  /**
   * Valide le format de période
   */
  static validatePeriode(periode: string): boolean {
    return /^\d{4}-\d{2}$/.test(periode)
  }

  /**
   * Construit les filtres de recherche
   */
  static buildFilters(request: PayslipQueryRequest): PayslipFilters {
    const where: PayslipFilters = {
      tenantId: request.tenantId,
      employee: {
        isActive: true
      }
    }

    // Filtre par période
    if (request.periode && this.validatePeriode(request.periode)) {
      const [year, month] = request.periode.split('-')
      where.year = parseInt(year)
      where.month = parseInt(month)
    }

    // Filtre par employé
    if (request.employeId) {
      where.employeeId = request.employeId
    }

    return where
  }

  /**
   * Compte le nombre total de bulletins
   */
  static async countPayslips(filters: PayslipFilters): Promise<number> {
    return await prisma.bulletinPaie.count({ where: filters })
  }

  /**
   * Récupère les bulletins avec pagination
   */
  static async getPayslips(filters: PayslipFilters, page: number, limit: number) {
    return await prisma.bulletinPaie.findMany({
      where: filters,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            position: true,
            departmentId: true,
            baseSalary: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { employee: { lastName: 'asc' } }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   * Récupère les bulletins avec le total en une seule requête
   */
  static async getPayslipsWithTotal(request: PayslipQueryRequest) {
    const filters = this.buildFilters(request)

    const [total, payslips] = await Promise.all([
      this.countPayslips(filters),
      this.getPayslips(filters, request.page, request.limit)
    ])

    return { total, payslips }
  }
}