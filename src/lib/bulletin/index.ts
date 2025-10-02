/**
 * Export centralisé - Module bulletin de paie refactorisé
 * Fichier: <150 lignes
 */

// === TYPES ===
export type {
  RubriqueType,
  ModeCalcul,
  EntrepriseInfo,
  EmployeeInfo,
  BulletinTemplate,
  BulletinOptions,
  RubriquePersonnalisee,
  BulletinPaie,
  RubriqueEmploye
} from './types'

// === GÉNÉRATEUR PRINCIPAL ===
export { BulletinGenerator } from './generator'

// === UTILITAIRES ===
export { BulletinFormatters } from './formatters'
export { BulletinStyles } from './styles'
export { BulletinSections } from './sections'

// === FONCTION DE COMMODITÉ ===
import { BulletinGenerator } from './generator'

/**
 * Génère un bulletin HTML - Interface simplifiée
 */
export function generateBulletinHTML(template: import('./types').BulletinTemplate): string {
  return BulletinGenerator.generateHTML(template)
}

/**
 * Valide un template de bulletin
 */
export function validateBulletinTemplate(template: import('./types').BulletinTemplate): {
  readonly valid: boolean
  readonly errors: readonly string[]
} {
  const errors: string[] = []

  if (!template.employe?.nom) {
    errors.push('Nom employé requis')
  }
  if (!template.employe?.prenom) {
    errors.push('Prénom employé requis')
  }
  if (!template.periode || !/^\d{4}-\d{2}$/.test(template.periode)) {
    errors.push('Période invalide (format YYYY-MM requis)')
  }
  if (!template.bulletin) {
    errors.push('Données bulletin requises')
  }
  if (!template.entreprise?.nom) {
    errors.push('Nom entreprise requis')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Crée un template par défaut
 */
export function createDefaultTemplate(): Partial<import('./types').BulletinTemplate> {
  return {
    options: {
      afficherChargesEmployeur: true,
      afficherCoutTotal: true,
      masquerRubriquesNulles: true,
      grouperParType: false
    }
  }
}

// === COMPATIBILITÉ AVEC L'ANCIEN MODULE ===

/**
 * @deprecated Utiliser BulletinGenerator.generateHTML à la place
 */
export const BulletinGeneratorLegacy = BulletinGenerator

/**
 * Manager de rubriques personnalisées
 */
export class RubriqueManager {

  /**
   * Ajoute une rubrique personnalisée au bulletin
   */
  static ajouterRubrique(
    bulletin: import('./types').BulletinPaie,
    rubrique: import('./types').RubriquePersonnalisee,
    valeur: number
  ): import('./types').BulletinPaie {
    const nouvelleRubrique: import('./types').RubriqueEmploye = {
      code: rubrique.code,
      libelle: rubrique.libelle,
      type: rubrique.type === 'gain' ? 'GAIN_BRUT' : 'RETENUE_NON_SOUMISE',
      modeCalcul: { type: 'MONTANT_FIXE', valeur: valeur },
      montant: valeur,
      soumisCnss: rubrique.soumisCotisations || false,
      soumisIrpp: rubrique.soumisCotisations || false
    }

    if (rubrique.type === 'gain') {
      bulletin.gains.rubriques.push(nouvelleRubrique)
      this.recalculerTotauxGains(bulletin)
    } else {
      bulletin.retenues.autresRetenues.rubriques.push(nouvelleRubrique)
      this.recalculerTotauxRetenues(bulletin)
    }

    return bulletin
  }

  /**
   * Recalcule les totaux gains
   */
  private static recalculerTotauxGains(bulletin: import('./types').BulletinPaie): void {
    const rubriques = bulletin.gains.rubriques
    bulletin.gains.totalBrutSocial = rubriques.filter(r => r.soumisCnss).reduce((sum, r) => sum + r.montant, 0)
    bulletin.gains.totalBrutFiscal = rubriques.filter(r => r.soumisIrpp).reduce((sum, r) => sum + r.montant, 0)
    bulletin.gains.totalGainsNonSoumis = rubriques.filter(r => !r.soumisCnss && !r.soumisIrpp).reduce((sum, r) => sum + r.montant, 0)
    bulletin.gains.totalGains = rubriques.reduce((sum, r) => sum + r.montant, 0)
  }

  /**
   * Recalcule les totaux retenues
   */
  private static recalculerTotauxRetenues(bulletin: import('./types').BulletinPaie): void {
    bulletin.retenues.autresRetenues.total = bulletin.retenues.autresRetenues.rubriques.reduce((sum, r) => sum + r.montant, 0)
    bulletin.retenues.totalRetenues = bulletin.retenues.cotisationsEmploye.total + bulletin.retenues.autresRetenues.total
  }
}