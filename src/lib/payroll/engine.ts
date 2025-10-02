// Moteur de paie refactorisé - NORM PAIE
// Fichier: 75 lignes

import { BulletinPaie, EmployeePaieData, RubriqueEmploye } from './types'
import { GainsCalculator } from './gains-calculator'
import { RetenuesCalculator } from './retenues-calculator'
import { calculateChargesEmployeur, calculateNetAPayer } from '../payroll-cotisations'

export class PayrollEngine {

  /**
   * Calcule un bulletin de paie complet
   */
  static async calculateBulletin(data: EmployeePaieData): Promise<BulletinPaie> {

    // 1. VALIDATION DES DONNÉES
    this.validateData(data)

    // 2. CALCUL DES GAINS (async maintenant)
    const gains = await GainsCalculator.calculateAllGains(data)

    // 3. CALCUL DES ASSIETTES
    const assiettes = this.calculateAssiettes(gains)

    // Convertir periode string en Date (UTC pour éviter problèmes de timezone)
    const [year, month] = data.periode.split('-')
    const periodeDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1))

    // 4. CALCUL DES RETENUES (async)
    const retenues = await RetenuesCalculator.calculateAllRetenues(
      data.tenantId,
      assiettes.brutSocial,
      assiettes.brutFiscal,
      data.chargesDeductibles || 0,
      data.rubriquesSaisies,
      data.quotientFamilial || 1,
      periodeDate
    )

    // 5. CALCUL CHARGES EMPLOYEUR (async)
    const chargesEmployeur = await calculateChargesEmployeur(
      data.tenantId,
      assiettes.brutSocial,
      assiettes.brutFiscal,
      periodeDate
    )

    // 6. CONSTRUCTION DES RUBRIQUES DE COTISATIONS
    const cotisationsRubriques = await this.buildCotisationsRubriques(
      data.tenantId,
      assiettes.brutSocial,
      assiettes.brutFiscal,
      data.chargesDeductibles || 0,
      retenues.cotisationsEmploye,
      chargesEmployeur,
      periodeDate,
      {
        maritalStatus: data.maritalStatus,
        childrenCount: data.childrenCount
      }
    )

    // 7. CALCUL NET À PAYER
    const netAPayer = calculateNetAPayer(
      assiettes.brutFiscal,
      retenues.cotisationsEmploye.total,
      retenues.autresRetenues.total
    )

    // 8. COUT TOTAL EMPLOYEUR
    const coutTotalEmployeur = assiettes.brutSocial + chargesEmployeur.total

    return {
      employeeId: data.employeeId,
      periode: data.periode,
      dateCalcul: new Date(),
      gains,
      retenues,
      cotisations: {
        rubriques: cotisationsRubriques,
        totalCotisations: retenues.cotisationsEmploye.total + chargesEmployeur.total
      },
      chargesEmployeur,
      netAPayer,
      coutTotalEmployeur
    }
  }

  /**
   * Calcule les assiettes de cotisations
   */
  private static calculateAssiettes(gains: { totalBrutSocial: number; totalBrutFiscal: number }) {
    const brutSocial = gains.totalBrutSocial
    const brutFiscal = gains.totalBrutFiscal

    return {
      brutSocial,
      brutFiscal
    }
  }

  /**
   * Construit les rubriques détaillées de cotisations
   * UTILISE LE MOTEUR UNIFIÉ (SharedPayrollEngine) - Source unique de vérité
   */
  private static async buildCotisationsRubriques(
    tenantId: string,
    brutSocial: number,
    brutFiscal: number,
    chargesDeductibles: number,
    cotisationsEmploye: { cnss: number; camu: number; irpp: number },
    chargesEmployeur: { cnss: number; allocationsFamiliales: number; accidentsTravail: number; taxeUniqueSS: number; tus: number; total: number },
    periode: Date,
    employeeData?: { maritalStatus?: string; childrenCount?: number }
  ): Promise<RubriqueEmploye[]> {
    const { SharedPayrollEngine } = await import('./shared-payroll-engine')
    const { RubriquesService } = await import('@/lib/services/rubriques.service')

    // Contexte de calcul
    const context = {
      tenantId,
      employee: {
        id: '', // À remplir avec les vraies données si nécessaire
        baseSalary: 0,
        maritalStatus: employeeData?.maritalStatus,
        childrenCount: employeeData?.childrenCount
      },
      periode,
      joursTravailles: 26,
      brutSocial,
      brutFiscal,
      chargesDeductibles,
      quotientFamilial: 1,
      rubriquesSaisies: []
    }

    // Récupérer les rubriques de cotisations depuis la DB
    const rubriquesCotisations = await RubriquesService.getCotisationsRubriques(tenantId)

    // Calculer chaque rubrique avec le moteur unifié
    const cotisationsCalculees = await Promise.all(
      rubriquesCotisations.map(rubrique =>
        SharedPayrollEngine.calculateRubriqueValue(rubrique, context)
      )
    )

    // Convertir en format RubriqueEmploye
    const rubriques: RubriqueEmploye[] = cotisationsCalculees
      .filter(calc => calc.montantTotal > 0) // Ne garder que les rubriques avec montant
      .map(calc => ({
        code: calc.code,
        libelle: calc.libelle,
        type: calc.type,
        modeCalcul: calc.tauxEmploye || calc.tauxEmployeur
          ? { type: 'TAUX', valeur: calc.tauxEmploye || calc.tauxEmployeur || 0 }
          : { type: 'FORMULE', valeur: calc.baseLibelle || '' },
        montant: calc.montantTotal,
        base: calc.base,
        tauxEmploye: calc.tauxEmploye,
        tauxEmployeur: calc.tauxEmployeur,
        montantEmploye: calc.montantEmploye,
        montantEmployeur: calc.montantEmployeur,
        soumisCnss: calc.soumisCnss,
        soumisIrpp: calc.soumisIrpp
      }))

    return rubriques
  }

  /**
   * Validation des données d'entrée
   */
  private static validateData(data: EmployeePaieData): void {
    if (!data.employeeId) throw new Error('employeeId requis')
    if (!data.periode) throw new Error('periode requis')
    if (data.baseSalary <= 0) throw new Error('baseSalary doit être > 0')
    if (!/^\d{4}-\d{2}$/.test(data.periode)) throw new Error('Format periode invalide (YYYY-MM)')
  }
}