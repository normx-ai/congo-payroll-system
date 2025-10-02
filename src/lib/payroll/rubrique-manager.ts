// Gestionnaire de rubriques - NORM PAIE
// Fichier: 110 lignes

import { rubriquesDiponibles } from '@/components/parametres/rubriquesData'

const RUBRIQUES_GAINS = rubriquesDiponibles.filter(r => r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS')
const RUBRIQUES_COTISATIONS = rubriquesDiponibles.filter(r => r.type === 'COTISATION' || r.type === 'RETENUE_NON_SOUMISE' || r.type === 'ELEMENT_NON_IMPOSABLE')

export class RubriqueManager {

  /**
   * Récupère toutes les rubriques disponibles
   */
  static getAllRubriques() {
    return [
      ...RUBRIQUES_GAINS.map(r => ({ ...r, categorie: 'gain' })),
      ...RUBRIQUES_COTISATIONS.map(r => ({ ...r, categorie: 'cotisation' }))
    ]
  }

  /**
   * Filtre les rubriques selon les critères
   */
  static filterRubriques(filters: {
    type?: string
    obligatoire?: boolean
    actif?: boolean
  }) {
    const rubriques = this.getAllRubriques()

    return rubriques.filter(rubrique => {
      // Filtre statut actif
      if (filters.actif !== undefined && rubrique.isActive !== filters.actif) {
        return false
      }

      // Filtre obligatoire (propriété n'existe plus, on ignore ce filtre)
      // if (filters.obligatoire !== undefined && rubrique.obligatoire !== filters.obligatoire) {
      //   return false
      // }

      // Filtre par type
      if (filters.type) {
        switch (filters.type) {
          case 'gains':
            return ['salaire', 'prime', 'indemnite', 'majoration', 'heureSupplementaire'].includes(rubrique.type)
          case 'cotisations':
            return ['cotisationEmploye', 'cotisationEmployeur'].includes(rubrique.type)
          case 'retenues':
            return ['retenue', 'taxe'].includes(rubrique.type)
        }
      }

      return true
    })
  }

  /**
   * Groupe les rubriques par catégorie
   */
  static groupByCategory(rubriques: Array<{ type: string }>) {
    return {
      salaires: rubriques.filter(r => r.type === 'salaire'),
      primes: rubriques.filter(r => r.type === 'prime'),
      indemnites: rubriques.filter(r => r.type === 'indemnite'),
      majorations: rubriques.filter(r => r.type === 'majoration'),
      heuresSupplementaires: rubriques.filter(r => r.type === 'heureSupplementaire'),
      cotisationsEmploye: rubriques.filter(r => r.type === 'cotisationEmploye'),
      cotisationsEmployeur: rubriques.filter(r => r.type === 'cotisationEmployeur'),
      retenues: rubriques.filter(r => r.type === 'retenue'),
      taxes: rubriques.filter(r => r.type === 'taxe')
    }
  }

  /**
   * Valide une sélection de rubriques
   */
  static validateSelection(codes: string[], inclureObligatoires = true) {
    const toutesRubriques = this.getAllRubriques()
    const codesExistants = toutesRubriques.map(r => r.code)

    // Vérifier codes invalides
    const codesInvalides = codes.filter(code => !codesExistants.includes(code))
    if (codesInvalides.length > 0) {
      return {
        valid: false,
        error: 'Codes de rubriques invalides',
        codesInvalides: codesInvalides
      }
    }

    // Vérifier rubriques obligatoires si demandé
    if (inclureObligatoires) {
      const obligatoires = toutesRubriques
        .filter(r => r.isActive) // Plus de propriété obligatoire
        .map(r => r.code)

      const manquantes = obligatoires.filter(code => !codes.includes(code))
      if (manquantes.length > 0) {
        return {
          valid: false,
          error: 'Rubriques obligatoires manquantes',
          rubriquesManquantes: manquantes
        }
      }
    }

    return { valid: true }
  }

  /**
   * Récupère les recommandations de rubriques pour un employé
   */
  static getRecommendations() {
    const obligatoires = this.filterRubriques({ obligatoire: true, actif: true })
    const recommendees = this.filterRubriques({ obligatoire: false, actif: true })
      .filter(r => ['100', '600', '300'].includes(r.code)) // Codes recommandés

    return {
      obligatoires: obligatoires.map(r => ({
        code: r.code,
        libelle: r.libelle,
        type: r.type,
        categorie: r.categorie,
        isActive: r.isActive
      })),
      recommandees: recommendees.map(r => ({
        code: r.code,
        libelle: r.libelle,
        type: r.type,
        categorie: r.categorie,
        isActive: r.isActive
      }))
    }
  }

  /**
   * Formate une rubrique pour l'API
   */
  private static formatRubrique(rubrique: {
    code: string;
    libelle: string;
    type: string;
    modeCalcul: string;
    description?: string;
    obligatoire: boolean;
    soumisCnss?: boolean;
    soumisIrpp?: boolean;
    montantFixe?: number;
    tauxEmploye?: number;
  }) {
    return {
      code: rubrique.code,
      libelle: rubrique.libelle,
      type: rubrique.type,
      modeCalcul: rubrique.modeCalcul,
      description: rubrique.description,
      obligatoire: rubrique.obligatoire,
      soumisCnss: rubrique.soumisCnss,
      soumisIrpp: rubrique.soumisIrpp,
      montantFixe: rubrique.montantFixe,
      tauxEmploye: rubrique.tauxEmploye
    }
  }
}