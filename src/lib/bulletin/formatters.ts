/**
 * Utilitaires de formatage pour bulletins de paie
 * Fichier: <150 lignes
 */

import { RubriqueEmploye } from './types'

/**
 * Formatage des données pour affichage bulletin
 */
export class BulletinFormatters {

  /**
   * Formate un montant en FCFA
   */
  static formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR')
  }

  /**
   * Formate une période YYYY-MM en français
   */
  static formatPeriode(periode: string): string {
    const [annee, mois] = periode.split('-')
    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]
    return `${moisNoms[parseInt(mois) - 1]} ${annee}`
  }

  /**
   * Formate la période en range pour en-tête
   */
  static formatPeriodeRange(periode: string): string {
    const [annee, mois] = periode.split('-')
    const moisInt = parseInt(mois)
    const premierJour = '01'
    const dernierJour = new Date(parseInt(annee), moisInt, 0).getDate().toString().padStart(2, '0')
    return `${premierJour}/${mois}/${annee} AU ${dernierJour}/${mois}/${annee}`
  }

  /**
   * Calcule la date de paiement (dernier jour du mois)
   */
  static getDatePaiement(periode: string): string {
    const [annee, mois] = periode.split('-')
    const dernierJour = new Date(parseInt(annee), parseInt(mois), 0).getDate()
    return `${dernierJour}/${mois}/${annee}`
  }

  /**
   * Calcule l'ancienneté depuis date d'embauche
   */
  static calculerAnciennete(dateEmbauche: string): string {
    const embauche = new Date(dateEmbauche)
    const maintenant = new Date()
    const diffMs = maintenant.getTime() - embauche.getTime()
    const annees = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25))
    const mois = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44))
    return `${annees} AN(S) ET ${mois} MOIS`
  }

  /**
   * Calcule le nombre de parts fiscales
   */
  static calculerParts(situationFamiliale: string, enfants: number): number {
    const baseMarriage = situationFamiliale.toLowerCase().includes('mari') ? 2 : 1
    return baseMarriage + (enfants * 0.5)
  }

  /**
   * Extrait le salaire de base des rubriques
   */
  static getSalaireBase(rubriques: readonly RubriqueEmploye[]): number {
    const salaireBase = rubriques.find(r =>
      r.code === '0100' || r.libelle.toLowerCase().includes('salaire catégoriel') || r.libelle.toLowerCase().includes('salaire de base')
    )
    return salaireBase?.montant || 0
  }

  /**
   * Groupe les rubriques par type
   */
  static groupRubriquesByType(rubriques: readonly RubriqueEmploye[]): Record<string, RubriqueEmploye[]> {
    return rubriques.reduce((groups, rubrique) => {
      const type = rubrique.type
      if (!groups[type]) groups[type] = []
      groups[type].push(rubrique)
      return groups
    }, {} as Record<string, RubriqueEmploye[]>)
  }

  /**
   * Traduit les types de rubriques
   */
  static getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'salaire': 'SALAIRES',
      'prime': 'PRIMES',
      'indemnite': 'INDEMNITÉS',
      'majoration': 'MAJORATIONS',
      'heureSupplementaire': 'HEURES SUPPLÉMENTAIRES',
      'GAIN_BRUT': 'GAINS BRUTS',
      'GAIN_NON_SOUMIS': 'GAINS NON SOUMIS',
      'COTISATION': 'COTISATIONS',
      'RETENUE_NON_SOUMISE': 'RETENUES'
    }
    return labels[type] || type.toUpperCase()
  }

  /**
   * Filtre les rubriques selon les options
   */
  static filterRubriques(
    rubriques: readonly RubriqueEmploye[],
    masquerRubriquesNulles: boolean
  ): RubriqueEmploye[] {
    if (masquerRubriquesNulles) {
      return rubriques.filter(r => r.montant > 0)
    }
    return [...rubriques]
  }

  /**
   * Génère la liste HTML des gains
   */
  static generateGainsList(rubriques: readonly RubriqueEmploye[]): string {
    return rubriques.map(r => `
    <tr>
        <td>${r.code}</td>
        <td>${r.libelle}</td>
        <td>-</td>
        <td>${r.nbHeures || '-'}</td>
        <td class="montant">${this.formatMontant(r.montant)}</td>
    </tr>
    `).join('')
  }

  /**
   * Génère les gains groupés par type
   */
  static generateGainsGrouped(rubriques: readonly RubriqueEmploye[]): string {
    const groups = this.groupRubriquesByType(rubriques)
    let html = ''

    for (const [type, rubriquesList] of Object.entries(groups)) {
      html += `
      <tr class="group-header">
          <td colspan="5"><strong>${this.getTypeLabel(type)}</strong></td>
      </tr>
      ${this.generateGainsList(rubriquesList)}
      `
    }

    return html
  }

  /**
   * Valide une période YYYY-MM
   */
  static validatePeriode(periode: string): boolean {
    return /^\d{4}-\d{2}$/.test(periode)
  }

  /**
   * Génère un nom de fichier sécurisé
   */
  static generateFileName(employeeCode: string, periode: string): string {
    const cleanCode = employeeCode.replace(/[^a-zA-Z0-9]/g, '_')
    return `bulletin-${cleanCode}-${periode}.pdf`
  }
}