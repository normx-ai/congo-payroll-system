/**
 * Service de formatage des bulletins de paie
 * Transforme les données brutes en format API
 */

import { Bulletin } from '@/types/ui'

export class PayslipFormatter {
  /**
   * Récupère le nom du mois en français
   */
  static getMonthName(month: number): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return months[month - 1] || 'Mois inconnu'
  }

  /**
   * Formate un bulletin individuel
   */
  static formatPayslip(payslip: Bulletin) {
    return {
      id: payslip.id,
      employee: {
        id: payslip.employee.id,
        matricule: payslip.employee.matricule,
        nom: payslip.employee.nom,
        prenom: payslip.employee.prenom,
        poste: payslip.employee.poste,
        department: payslip.employee.department || 'N/A'
      },
      periode: {
        year: payslip.periode.year,
        month: payslip.periode.month,
        libelle: `${this.getMonthName(payslip.periode.month)} ${payslip.periode.year}`
      },
      montants: {
        salaireBase: payslip.montants.salaireBase,
        brut: payslip.montants.brut,
        cotisations: payslip.montants.cotisations,
        retenues: payslip.montants.retenues,
        net: payslip.montants.net
      },
      status: {
        genere: payslip.status.genere,
        envoye: payslip.status.envoye,
        dateCreation: payslip.status.dateCreation
      },
      notes: payslip.notes
    }
  }

  /**
   * Formate une liste de bulletins
   */
  static formatPayslips(payslips: Bulletin[]) {
    return payslips.map(payslip => this.formatPayslip(payslip))
  }

  /**
   * Calcule les statistiques des bulletins
   */
  static calculateStats(bulletins: Bulletin[], total: number) {
    return {
      totalBulletins: total,
      totalSalaireBase: bulletins.reduce((sum, b) => sum + b.montants.salaireBase, 0),
      totalBrut: bulletins.reduce((sum, b) => sum + b.montants.brut, 0),
      totalCotisations: bulletins.reduce((sum, b) => sum + b.montants.cotisations, 0),
      totalNet: bulletins.reduce((sum, b) => sum + b.montants.net, 0),
      employesDistincts: [...new Set(bulletins.map(b => b.employee.id))].length
    }
  }

  /**
   * Calcule les informations de pagination
   */
  static calculatePagination(page: number, limit: number, total: number) {
    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  }

  /**
   * Formate la réponse complète
   */
  static formatResponse(
    payslips: Bulletin[],
    total: number,
    page: number,
    limit: number,
    filters: { periode?: string; employeId?: string }
  ) {
    const bulletins = this.formatPayslips(payslips)
    const stats = this.calculateStats(bulletins, total)
    const pagination = this.calculatePagination(page, limit, total)

    return {
      success: true,
      bulletins,
      stats,
      pagination,
      filters: {
        periode: filters.periode || null,
        employeId: filters.employeId || null
      }
    }
  }
}