// Calculateur de retenues - NORM PAIE
// Fichier: 85 lignes

// Type depuis l'interface des rubriques
export type RubriqueType = 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
import { RubriqueEmploye, CotisationsEmploye } from './types'
import { calculateCotisationsEmploye } from '../payroll-cotisations'

export class RetenuesCalculator {

  static async calculateAllRetenues(
    tenantId: string,
    brutSocial: number,
    brutFiscal: number,
    chargesDeductibles: number,
    rubriquesSaisies: Array<{ code: string; montant: number }>,
    quotientFamilial: number = 1,
    periode: Date = new Date()
  ): Promise<{
    cotisationsEmploye: CotisationsEmploye
    autresRetenues: { rubriques: RubriqueEmploye[], total: number }
    totalRetenues: number
  }> {

    console.log('[DEBUG RetenuesCalculator.calculateAllRetenues] START')
    console.log('  - tenantId:', tenantId, 'type:', typeof tenantId)
    console.log('  - brutSocial:', brutSocial)
    console.log('  - brutFiscal:', brutFiscal)
    console.log('  - periode:', periode.toISOString())

    // 1. COTISATIONS OBLIGATOIRES
    const cotisationsEmploye = await calculateCotisationsEmploye(
      tenantId,
      brutSocial,
      brutFiscal,
      chargesDeductibles,
      quotientFamilial,
      periode
    )

    // 2. AUTRES RETENUES
    const autresRetenues = this.calculateAutresRetenues(rubriquesSaisies)

    // 3. TOTAL RETENUES
    const totalRetenues = cotisationsEmploye.total + autresRetenues.total

    return {
      cotisationsEmploye,
      autresRetenues,
      totalRetenues
    }
  }

  private static calculateAutresRetenues(rubriquesSaisies: Array<{ code: string; montant: number }>): {
    rubriques: RubriqueEmploye[]
    total: number
  } {
    const rubriques: RubriqueEmploye[] = []
    let total = 0

    rubriquesSaisies
      .filter(rs => this.isRetenue(rs.code))
      .forEach(saisie => {
        const rubrique = this.getRubriqueDefinition(saisie.code)
        if (rubrique && (rubrique.type === 'RETENUE_NON_SOUMISE' || rubrique.type === 'ELEMENT_NON_IMPOSABLE')) {

          const rubriqueEmploye: RubriqueEmploye = {
            code: rubrique.code,
            libelle: rubrique.libelle,
            type: rubrique.type,
            modeCalcul: { type: 'MONTANT_FIXE', valeur: saisie.montant },
            montant: saisie.montant,
            soumisCnss: false,
            soumisIrpp: false
          }

          rubriques.push(rubriqueEmploye)
          total += saisie.montant
        }
      })

    return { rubriques, total }
  }

  private static isRetenue(code: string): boolean {
    return code && code.startsWith('9') // Codes 9xx = retenues
  }

  private static getRubriqueDefinition(code: string) {
    // Simulation - En production, chercher dans RUBRIQUES_COTISATIONS
    const map: Record<string, { code: string; libelle: string; type: RubriqueType; modeCalcul: string }> = {
      '960': {
        code: '960',
        libelle: 'Avance salaire',
        type: 'RETENUE_NON_SOUMISE',
        modeCalcul: 'fixe'
      },
      '951': {
        code: '951',
        libelle: 'Prêt entreprise',
        type: 'RETENUE_NON_SOUMISE',
        modeCalcul: 'fixe'
      },
      '9110': {
        code: '9110',
        libelle: 'Arrondi net à payer',
        type: 'ELEMENT_NON_IMPOSABLE',
        modeCalcul: 'formule'
      }
    }
    return map[code]
  }

  // Méthodes utilitaires pour validation
  static validateRetenues(retenues: Array<{ code?: string; montant?: number }>): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    retenues.forEach(retenue => {
      if (!retenue.code || !retenue.montant) {
        errors.push(`Retenue invalide: code et montant requis`)
      }

      if ((retenue.montant ?? 0) < 0) {
        errors.push(`Montant retenue ${retenue.code} ne peut pas être négatif`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}