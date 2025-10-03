/**
 * MOTEUR DE CALCUL DE PAIE UNIFIÉ
 * Source unique de vérité pour les calculs de paie
 * Utilisé par le client ET le serveur
 * Basé sur les formules correctes du client + Base de données
 */

import { RubriqueDefinition } from '@/lib/services/rubriques.service'
import { ParametresFiscauxService } from '@/lib/services/parametres-fiscaux.service'
import { calculateIRPP as calculateIRPPLegacy } from '@/components/paie/workflow/irpp-calculation'

export interface CalculationContext {
  tenantId: string
  employee: {
    id: string
    baseSalary: number
    hireDate?: Date
    maritalStatus?: string
    childrenCount?: number
  }
  periode: Date
  joursTravailles: number
  brutSocial: number
  brutFiscal: number
  chargesDeductibles?: number
  quotientFamilial?: number
  rubriquesSaisies?: Array<{ code: string; montant: number }>
}

export interface RubriqueCalculationResult {
  code: string
  libelle: string
  type: string
  base?: number
  baseLibelle?: string
  tauxEmploye?: number
  tauxEmployeur?: number
  montantEmploye?: number
  montantEmployeur?: number
  montantTotal: number
  soumisCnss: boolean
  soumisIrpp: boolean
}

/**
 * Moteur de calcul unifié
 */
export class SharedPayrollEngine {

  /**
   * Calcule la valeur d'une rubrique selon sa formule
   * CETTE FONCTION EST LA SOURCE UNIQUE DE VÉRITÉ
   */
  static async calculateRubriqueValue(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {

    // Selon rubrique.code, exécuter la formule correspondante
    switch (rubrique.code) {
      case '3100': // CNSS
        return this.calculateCNSS(rubrique, context)

      case '3110': // Allocations familiales
        return this.calculateAllocationsFamiliales(rubrique, context)

      case '3120': // Accidents de travail
        return this.calculateAccidentsTravail(rubrique, context)

      case '3130': // Taxe unique (patronale)
        return this.calculateTaxeUnique(rubrique, context)

      case '3510': // IRPP
        return this.calculateIRPP(rubrique, context)

      case '3530': // TUS (Taxe unique sur salaire)
        return this.calculateTUS(rubrique, context)

      case '3540': // CAMU
        return this.calculateCAMU(rubrique, context)

      case '3550': // Taxe sur salaires locaux
        return this.calculateTaxeLocaux(rubrique)

      case '3560': // Taxe sur les locaux (Expat)
        return this.calculateTaxeLocaux(rubrique)

      case '3570': // Taxe régionale
        return this.calculateTaxeLocaux(rubrique)

      default:
        // Charge fixe ou montant manuel
        return this.calculateChargeFixe(rubrique)
    }
  }

  /**
   * Calcule CNSS avec base, taux, montant salarié et patronal
   * Formule CLIENT correcte: Math.min(salaireBrutTotal, 1200000) * 0.12
   */
  private static async calculateCNSS(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    // Récupérer les paramètres depuis la DB
    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['CNSS_EMPLOYE', 'CNSS_EMPLOYEUR', 'CNSS_PLAFOND'],
      periode
    )

    const plafond = params.CNSS_PLAFOND || 1200000
    const tauxEmploye = params.CNSS_EMPLOYE || 4
    const tauxEmployeur = params.CNSS_EMPLOYEUR || 8

    const baseImposable = Math.min(brutSocial, plafond)
    const montantEmploye = Math.round(baseImposable * (tauxEmploye / 100))
    const montantEmployeur = Math.round(baseImposable * (tauxEmployeur / 100))

    return {
      code: '3100',
      libelle: rubrique.libelle || 'Retenue CNSS',
      type: 'COTISATION',
      base: baseImposable,
      baseLibelle: `Brut plafonné à ${plafond.toLocaleString()}`,
      tauxEmploye,
      tauxEmployeur,
      montantEmploye,
      montantEmployeur,
      montantTotal: montantEmploye + montantEmployeur,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule Allocations familiales
   * Formule CLIENT correcte: Math.min(salaireBrutTotal, 600000) * 0.1003
   */
  private static async calculateAllocationsFamiliales(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['AF_TAUX', 'AF_PLAFOND'],
      periode
    )

    const plafond = params.AF_PLAFOND || 600000
    const taux = params.AF_TAUX || 10.03

    const baseImposable = Math.min(brutSocial, plafond)
    const montant = Math.round(baseImposable * (taux / 100))

    return {
      code: '3110',
      libelle: rubrique.libelle || 'SS - Allocations familiales',
      type: 'COTISATION',
      base: baseImposable,
      baseLibelle: `Brut plafonné à ${plafond.toLocaleString()}`,
      tauxEmploye: 0,
      tauxEmployeur: taux,
      montantEmploye: 0,
      montantEmployeur: montant,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule Accidents de travail
   * Formule CLIENT correcte: Math.min(salaireBrutTotal, 600000) * 0.0225
   */
  private static async calculateAccidentsTravail(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['AT_TAUX', 'AT_PLAFOND'],
      periode
    )

    const plafond = params.AT_PLAFOND || 600000
    const taux = params.AT_TAUX || 2.25

    const baseImposable = Math.min(brutSocial, plafond)
    const montant = Math.round(baseImposable * (taux / 100))

    return {
      code: '3120',
      libelle: rubrique.libelle || 'SS - Accident de travail',
      type: 'COTISATION',
      base: baseImposable,
      baseLibelle: `Brut plafonné à ${plafond.toLocaleString()}`,
      tauxEmploye: 0,
      tauxEmployeur: taux,
      montantEmploye: 0,
      montantEmployeur: montant,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule Taxe unique (patronale)
   * Formule CLIENT correcte: salaireBrutTotal * 0.03375
   */
  private static async calculateTaxeUnique(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['TUS_SS_TAUX'],
      periode
    )

    const taux = params.TUS_SS_TAUX || 3.375

    const montant = Math.round(brutSocial * (taux / 100))

    return {
      code: '3130',
      libelle: rubrique.libelle || 'SS - Taxe unique sur salaire',
      type: 'COTISATION',
      base: brutSocial,
      baseLibelle: 'Salaire brut',
      tauxEmploye: 0,
      tauxEmployeur: taux,
      montantEmploye: 0,
      montantEmployeur: montant,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule IRPP
   * Formule CLIENT correcte: calculateIRPP(salaireBrutTotal, employee)
   */
  private static async calculateIRPP(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { brutSocial, employee } = context

    // Utiliser la fonction IRPP existante du client (qui est correcte)
    const irppEmployee = {
      id: employee.id,
      firstName: '',
      lastName: '',
      employeeCode: '',
      position: '',
      baseSalary: employee.baseSalary,
      maritalStatus: employee.maritalStatus,
      childrenCount: employee.childrenCount
    }
    const montant = calculateIRPPLegacy(brutSocial, irppEmployee)

    return {
      code: '3510',
      libelle: rubrique.libelle || 'Retenue IRPP du mois',
      type: 'COTISATION',
      base: brutSocial,
      baseLibelle: 'Salaire imposable',
      tauxEmploye: 0, // Variable selon tranche
      tauxEmployeur: 0,
      montantEmploye: montant,
      montantEmployeur: 0,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule TUS (Taxe unique sur salaire)
   * Formule CLIENT correcte: salaireBrutTotal * 0.04125
   */
  private static async calculateTUS(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['TUS_TAUX'],
      periode
    )

    const taux = params.TUS_TAUX || 4.125

    const montant = Math.round(brutSocial * (taux / 100))

    return {
      code: '3530',
      libelle: rubrique.libelle || 'Taxe unique sur salaire',
      type: 'COTISATION',
      base: brutSocial,
      baseLibelle: 'Salaire brut',
      tauxEmploye: taux,
      tauxEmployeur: 0,
      montantEmploye: montant,
      montantEmployeur: 0,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule CAMU
   * Formule CLIENT correcte: Math.max(0, (salaireBrutTotal - cotisationsSociales - 500000) * 0.005)
   */
  private static async calculateCAMU(
    rubrique: RubriqueDefinition,
    context: CalculationContext
  ): Promise<RubriqueCalculationResult> {
    const { tenantId, brutSocial, periode } = context

    const params = await ParametresFiscauxService.getParametres(
      tenantId,
      ['CAMU_CONTRIBUTION', 'CAMU_SEUIL', 'CNSS_EMPLOYE', 'CNSS_PLAFOND'],
      periode
    )

    const taux = params.CAMU_CONTRIBUTION || 0.5
    const seuil = params.CAMU_SEUIL || 500000
    const tauxCnssEmploye = params.CNSS_EMPLOYE || 4
    const plafondCnss = params.CNSS_PLAFOND || 1200000

    // Calcul cotisations sociales (part employé CNSS)
    const cotisationsSociales = Math.min(brutSocial, plafondCnss) * (tauxCnssEmploye / 100)

    const baseImposable = Math.max(0, brutSocial - cotisationsSociales - seuil)
    const montant = Math.round(baseImposable * (taux / 100))

    return {
      code: '3540',
      libelle: rubrique.libelle || 'Retenue CAMU',
      type: 'COTISATION',
      base: baseImposable,
      baseLibelle: `Excédent > ${seuil.toLocaleString()} FCFA`,
      tauxEmploye: taux,
      tauxEmployeur: 0,
      montantEmploye: montant,
      montantEmployeur: 0,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Calcule Taxe sur salaires locaux
   * Formule: Montant fixe selon la rubrique
   * 3550: 1000 FCFA (local)
   * 3560: 5000 FCFA (Expat)
   * 3570: 2400 FCFA (Taxe régionale)
   */
  private static async calculateTaxeLocaux(
    rubrique: RubriqueDefinition
  ): Promise<RubriqueCalculationResult> {
    // Déterminer le montant selon le code de la rubrique
    let montant = 0
    switch (rubrique.code) {
      case '3550':
        montant = 1000 // Taxe locaux (local)
        break
      case '3560':
        montant = 5000 // Taxe locaux (Expat)
        break
      case '3570':
        montant = 2400 // Taxe régionale
        break
      default:
        montant = 1000
    }

    return {
      code: rubrique.code,
      libelle: rubrique.libelle || 'Taxe sur salaires locaux',
      type: 'COTISATION',
      base: montant,
      baseLibelle: 'Montant fixe',
      tauxEmploye: 0,
      tauxEmployeur: 0,
      montantEmploye: montant,
      montantEmployeur: 0,
      montantTotal: montant,
      soumisCnss: false,
      soumisIrpp: false
    }
  }

  /**
   * Charge fixe ou montant par défaut
   */
  private static async calculateChargeFixe(
    rubrique: RubriqueDefinition
  ): Promise<RubriqueCalculationResult> {
    // Pour les rubriques sans formule spécifique
    return {
      code: rubrique.code,
      libelle: rubrique.libelle,
      type: rubrique.type,
      base: 0,
      baseLibelle: 'N/A',
      tauxEmploye: 0,
      tauxEmployeur: 0,
      montantEmploye: 0,
      montantEmployeur: 0,
      montantTotal: 0,
      soumisCnss: rubrique.imposable,
      soumisIrpp: rubrique.imposable
    }
  }
}
