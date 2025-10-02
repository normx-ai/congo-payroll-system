// Calculateur de gains - NORM PAIE
// Fichier: 95 lignes

// Types depuis l'interface des rubriques
export type RubriqueType = 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'
export interface ModeCalcul {
  type: 'TAUX' | 'MONTANT_FIXE' | 'FORMULE'
  valeur: number | string
}
import { RubriqueEmploye, EmployeePaieData } from './types'
import { calculatePrimeAnciennete, calculateSalaireHoraire } from '../payroll-calculs'
import { RubriquesService } from '../services/rubriques.service'

export class GainsCalculator {

  static async calculateAllGains(data: EmployeePaieData): Promise<{
    rubriques: RubriqueEmploye[]
    totalBrutSocial: number
    totalBrutFiscal: number
    totalGainsNonSoumis: number
    totalGains: number
  }> {
    const rubriques: RubriqueEmploye[] = []

    // 1. SALAIRE DE BASE (obligatoire)
    rubriques.push(this.createSalaireBase(data.baseSalary, data.joursTravailles))

    // 2. PRIME D'ANCIENNETÉ
    const primeAnciennete = calculatePrimeAnciennete(
      data.baseSalary,
      data.ancienneteAnnees
    )
    if (primeAnciennete > 0) {
      rubriques.push(this.createPrimeAnciennete(primeAnciennete))
    }

    // 3. RUBRIQUES SAISIES
    for (const saisie of data.rubriquesSaisies) {
      const rubrique = await this.calculateRubriqueSaisie(saisie, data.baseSalary, data.tenantId)
      if (rubrique) rubriques.push(rubrique)
    }

    // 4. CALCUL DES TOTAUX
    return this.calculateTotaux(rubriques)
  }

  private static createSalaireBase(montant: number, joursTravailles: number): RubriqueEmploye {
    return {
      code: '0100',
      libelle: 'Salaire catégoriel',
      type: 'GAIN_BRUT',
      modeCalcul: { type: 'MONTANT_FIXE', valeur: montant },
      montant,
      soumisCnss: true,
      soumisIrpp: true,
      nbHeures: joursTravailles
    }
  }

  private static createPrimeAnciennete(montant: number): RubriqueEmploye {
    return {
      code: '1010',
      libelle: 'Prime d\'ancienneté',
      type: 'GAIN_BRUT',
      modeCalcul: { type: 'FORMULE', valeur: 'primeAnciennete' },
      montant,
      soumisCnss: true,
      soumisIrpp: true
    }
  }

  private static async calculateRubriqueSaisie(
    saisie: { code: string, montant: number, nbHeures?: number },
    salaireBase: number,
    tenantId: string
  ): Promise<RubriqueEmploye | null> {
    // Récupérer la définition depuis la base de données
    const rubriquesDef = await RubriquesService.getRubrique(tenantId, saisie.code)
    if (!rubriquesDef) {
      console.warn(`Rubrique ${saisie.code} non trouvée pour tenantId ${tenantId}`)
      return null
    }

    // IMPORTANT: S'assurer que le montant est un nombre
    let montant = typeof saisie.montant === 'string' ? parseFloat(saisie.montant) : Number(saisie.montant)
    let nbHeures = saisie.nbHeures

    // Calcul spécial heures supplémentaires
    if (rubriquesDef.code.startsWith('700') && saisie.nbHeures) {
      const tauxHoraire = calculateSalaireHoraire(salaireBase)
      montant = this.calculateHeuresSup(saisie.code, tauxHoraire, saisie.nbHeures)
    }

    // Déterminer si soumis à CNSS et IRPP selon le type
    const soumisCnss = rubriquesDef.type === 'GAIN_BRUT'
    const soumisIrpp = rubriquesDef.imposable

    return {
      code: rubriquesDef.code,
      libelle: rubriquesDef.libelle,
      type: rubriquesDef.type as any,
      modeCalcul: { type: 'MONTANT_FIXE', valeur: montant },
      montant,
      soumisCnss,
      soumisIrpp,
      nbHeures
    }
  }

  private static calculateHeuresSup(code: string, tauxHoraire: number, nbHeures: number): number {
    const majorations: { [key: string]: number } = {
      '700': 1.10, '701': 1.25, '702': 1.50, '703': 2.00
    }
    const majoration = majorations[code] || 1.0
    return Math.round(tauxHoraire * nbHeures * majoration)
  }

  private static calculateTotaux(rubriques: RubriqueEmploye[]) {
    const totalBrutSocial = rubriques.filter(r => r.soumisCnss).reduce((sum, r) => sum + r.montant, 0)
    const totalBrutFiscal = rubriques.filter(r => r.soumisIrpp).reduce((sum, r) => sum + r.montant, 0)
    const totalGainsNonSoumis = rubriques.filter(r => !r.soumisCnss && !r.soumisIrpp).reduce((sum, r) => sum + r.montant, 0)
    const totalGains = rubriques.reduce((sum, r) => sum + r.montant, 0)

    return {
      rubriques,
      totalBrutSocial,
      totalBrutFiscal,
      totalGainsNonSoumis,
      totalGains
    }
  }
}