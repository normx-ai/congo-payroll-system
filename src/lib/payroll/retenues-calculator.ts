// Calculateur de retenues - NORM PAIE
// Fichier: 85 lignes

// Type depuis l'interface des rubriques
export type RubriqueType = 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
import { RubriqueEmploye, CotisationsEmploye } from './types'
import { calculateCotisationsEmploye } from '../payroll-cotisations'
import { rubriquesDiponibles } from '@/components/parametres/rubriquesData'

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

    console.log('[DEBUG calculateAutresRetenues] rubriquesSaisies:', rubriquesSaisies)

    rubriquesSaisies
      .filter(rs => this.isRetenue(rs.code))
      .forEach(saisie => {
        console.log(`[DEBUG calculateAutresRetenues] Processing retenue: ${saisie.code} montant: ${saisie.montant}`)

        // IMPORTANT: Exclure 9110 (arrondi) - il s'ajoute au net final, pas dans les retenues
        if (saisie.code === '9110') {
          console.log(`[DEBUG calculateAutresRetenues] Skipping 9110 (arrondi) - will be handled separately`)
          return
        }

        const rubrique = this.getRubriqueDefinition(saisie.code)
        console.log(`[DEBUG calculateAutresRetenues] Rubrique definition:`, rubrique ? { code: rubrique.code, type: rubrique.type } : 'NOT FOUND')

        // Seules les retenues 6xxx (RETENUE_NON_SOUMISE) sont déduites
        if (rubrique && rubrique.type === 'RETENUE_NON_SOUMISE') {

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
          console.log(`[DEBUG calculateAutresRetenues] Added to autresRetenues: ${rubrique.code} - ${saisie.montant}`)
        }
      })

    console.log('[DEBUG calculateAutresRetenues] RESULT:', { rubriqueCount: rubriques.length, total })
    return { rubriques, total }
  }

  private static isRetenue(code: string): boolean {
    // Codes 6xxx = RETENUE_NON_SOUMISE (pharmacie, prêt, etc.)
    // Codes 9xxx = ELEMENT_NON_IMPOSABLE (arrondi, etc.)
    return !!code && (code.startsWith('6') || code.startsWith('9'))
  }

  private static getRubriqueDefinition(code: string) {
    // Chercher dans les rubriques disponibles
    return rubriquesDiponibles.find(r => r.code === code)
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