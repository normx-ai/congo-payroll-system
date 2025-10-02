/**
 * Service dédié à la sélection et validation des rubriques de paie
 * Refactorisé depuis api/payroll/rubriques/selection/route.ts
 */

import { rubriquesDiponibles } from '@/components/parametres/rubriquesData'
import { Rubrique } from '@/types/ui'

export interface RubriqueSelectionRequest {
  employeId: string
  periode: string
  rubriquesGainsSelectionnees?: string[]
  rubriquesRetenuesSelectionnees?: string[]
  valeursRubriques?: Record<string, number>
  inclureObligatoires?: boolean
}

export interface RubriqueSelectionResult {
  success: boolean
  rubriquesFinales?: Rubrique[]
  rubriquesObligatoires?: Rubrique[]
  error?: string
  codesInvalides?: string[]
}

export class RubriqueSelectionService {
  private static readonly RUBRIQUES_GAINS = rubriquesDiponibles.filter(
    r => r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS'
  )

  private static readonly RUBRIQUES_COTISATIONS = rubriquesDiponibles.filter(
    r => r.type === 'COTISATION' || r.type === 'RETENUE_NON_SOUMISE'
  )

  private static readonly RUBRIQUES_OBLIGATOIRES = [
    '0100', // Salaire catégoriel
    '3100', // Retenue CNSS
    '3110', // SS - Allocations familiales
    '3120', // SS - Accident de travail
    '3510', // Retenue IRPP du mois
    '3530', // Taxe unique sur salaire
    '3130', // SS - Taxe unique sur salaire
    '3540', // Retenue CAMU
    '3550'  // Taxe sur les locaux (local)
  ]

  /**
   * Valide les paramètres de sélection
   */
  static validateRequest(request: RubriqueSelectionRequest): string | null {
    if (!request.employeId || !request.periode) {
      return 'employeId et periode sont requis'
    }

    if (!/^\d{4}-\d{2}$/.test(request.periode)) {
      return 'Format période invalide (attendu: YYYY-MM)'
    }

    return null
  }

  /**
   * Valide les codes de rubriques sélectionnées
   */
  static validateRubriqueCodes(
    rubriquesGains: string[],
    rubriquesRetenues: string[]
  ): { valid: boolean; invalidCodes: string[] } {
    const toutesRubriques = [...this.RUBRIQUES_GAINS, ...this.RUBRIQUES_COTISATIONS]
    const codesExistants = toutesRubriques.map(r => r.code)

    const codesSelectionnes = [...rubriquesGains, ...rubriquesRetenues]
    const codesInvalides = codesSelectionnes.filter(code => !codesExistants.includes(code))

    return {
      valid: codesInvalides.length === 0,
      invalidCodes: codesInvalides
    }
  }

  /**
   * Récupère les rubriques obligatoires
   */
  static getRubriquesObligatoires() {
    return rubriquesDiponibles.filter(r =>
      this.RUBRIQUES_OBLIGATOIRES.includes(r.code) && r.isActive
    )
  }

  /**
   * Filtre les rubriques selon la sélection
   */
  static filterSelectedRubriques(
    rubriquesGains: string[],
    rubriquesRetenues: string[],
    inclureObligatoires: boolean = true
  ) {
    let rubriquesFinales = []

    // Ajouter les rubriques de gains sélectionnées
    const gainsSelectionnes = this.RUBRIQUES_GAINS.filter(r =>
      rubriquesGains.includes(r.code) && r.isActive
    )

    // Ajouter les retenues sélectionnées
    const retenuesSelectionnees = this.RUBRIQUES_COTISATIONS.filter(r =>
      rubriquesRetenues.includes(r.code) && r.isActive
    )

    rubriquesFinales = [...gainsSelectionnes, ...retenuesSelectionnees]

    // Ajouter les obligatoires si demandé
    if (inclureObligatoires) {
      const obligatoires = this.getRubriquesObligatoires()

      // Éviter les doublons
      const codesDejaPresents = rubriquesFinales.map(r => r.code)
      const obligatoiresManquants = obligatoires.filter(r =>
        !codesDejaPresents.includes(r.code)
      )

      rubriquesFinales = [...rubriquesFinales, ...obligatoiresManquants]
    }

    return rubriquesFinales
  }

  /**
   * Applique les valeurs saisies aux rubriques
   */
  static applyCustomValues(
    rubriques: Rubrique[],
    valeursRubriques: Record<string, number>
  ) {
    return rubriques.map(rubrique => ({
      ...rubrique,
      valeurSaisie: valeursRubriques[rubrique.code] || null,
      utilisationFormule: valeursRubriques[rubrique.code] ? false : true
    }))
  }

  /**
   * Génère les statistiques de sélection
   */
  static generateStats(rubriquesFinales: Rubrique[]) {
    const gainsBruts = rubriquesFinales.filter(r => r.type === 'GAIN_BRUT')
    const gainsNonSoumis = rubriquesFinales.filter(r => r.type === 'GAIN_NON_SOUMIS')
    const cotisations = rubriquesFinales.filter(r => r.type === 'COTISATION')
    const retenues = rubriquesFinales.filter(r => r.type === 'RETENUE_NON_SOUMISE')

    return {
      total: rubriquesFinales.length,
      repartition: {
        gainsBruts: gainsBruts.length,
        gainsNonSoumis: gainsNonSoumis.length,
        cotisations: cotisations.length,
        retenues: retenues.length
      },
      obligatoires: rubriquesFinales.filter(r =>
        this.RUBRIQUES_OBLIGATOIRES.includes(r.code)
      ).length
    }
  }

  /**
   * Traite une sélection complète de rubriques
   */
  static processSelection(request: RubriqueSelectionRequest): RubriqueSelectionResult {
    try {
      // 1. Validation de base
      const validationError = this.validateRequest(request)
      if (validationError) {
        return { success: false, error: validationError }
      }

      // 2. Validation des codes
      const validation = this.validateRubriqueCodes(
        request.rubriquesGainsSelectionnees || [],
        request.rubriquesRetenuesSelectionnees || []
      )

      if (!validation.valid) {
        return {
          success: false,
          error: 'Codes de rubriques invalides',
          codesInvalides: validation.invalidCodes
        }
      }

      // 3. Filtrer les rubriques sélectionnées
      let rubriquesFinales = this.filterSelectedRubriques(
        request.rubriquesGainsSelectionnees || [],
        request.rubriquesRetenuesSelectionnees || [],
        request.inclureObligatoires !== false
      )

      // 4. Appliquer les valeurs saisies
      if (request.valeursRubriques) {
        rubriquesFinales = this.applyCustomValues(rubriquesFinales, request.valeursRubriques)
      }

      // 5. Trier par type puis par code
      rubriquesFinales.sort((a, b) => {
        if (a.type !== b.type) {
          const ordre = ['GAIN_BRUT', 'GAIN_NON_SOUMIS', 'COTISATION', 'RETENUE_NON_SOUMISE']
          return ordre.indexOf(a.type) - ordre.indexOf(b.type)
        }
        return a.code.localeCompare(b.code)
      })

      return {
        success: true,
        rubriquesFinales,
        rubriquesObligatoires: this.getRubriquesObligatoires()
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  /**
   * Récupère toutes les rubriques disponibles par catégorie
   */
  static getAllRubriquesByCategory() {
    return {
      gains: this.RUBRIQUES_GAINS.filter(r => r.isActive),
      retenues: this.RUBRIQUES_COTISATIONS.filter(r => r.isActive),
      obligatoires: this.getRubriquesObligatoires(),
      inactives: rubriquesDiponibles.filter(r => !r.isActive)
    }
  }
}