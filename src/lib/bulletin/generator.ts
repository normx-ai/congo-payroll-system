/**
 * Générateur principal de bulletins de paie
 * Fichier: <150 lignes
 */

import { BulletinTemplate } from './types'
import { BulletinStyles } from './styles'
import { BulletinSections } from './sections'

/**
 * Générateur principal de bulletins
 */
export class BulletinGenerator {

  /**
   * Génère le HTML complet du bulletin
   */
  static generateHTML(template: BulletinTemplate): string {
    this.validateTemplate(template)

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulletin de Paie - ${template.employe.nom} ${template.employe.prenom}</title>
    <style>
        ${BulletinStyles.getCSS()}
    </style>
</head>
<body>
    <div class="bulletin-container">
        ${BulletinSections.generateHeader(template)}
        ${BulletinSections.generateEmployeeInfo(template)}
        ${BulletinSections.generateGainsSection(template)}
        ${this.generateRetenuesSection(template)}
        ${this.generateElementsNonImposablesSection(template)}
        ${this.generateChargesSection(template)}
        ${BulletinSections.generateSummary(template)}
        ${BulletinSections.generateFooter()}
    </div>
</body>
</html>
    `
  }

  /**
   * Génère la section retenues
   */
  private static generateRetenuesSection(template: BulletinTemplate): string {
    const { retenues } = template.bulletin

    return `
    <div class="retenues-section">
        <h3>RETENUES</h3>

        <h4>Cotisations Sociales</h4>
        <table class="rubriques-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Libellé</th>
                    <th>Base</th>
                    <th>Taux</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>800</td>
                    <td>CNSS Employé</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>4.00%</td>
                    <td class="montant">${this.formatMontant(retenues.cotisationsEmploye.cnss)}</td>
                </tr>
                <tr>
                    <td>802</td>
                    <td>CAMU Employé</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>2.00%</td>
                    <td class="montant">${this.formatMontant(retenues.cotisationsEmploye.camu)}</td>
                </tr>
                <tr>
                    <td>900</td>
                    <td>IRPP</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutFiscal)}</td>
                    <td>Barème</td>
                    <td class="montant">${this.formatMontant(retenues.cotisationsEmploye.irpp)}</td>
                </tr>
            </tbody>
        </table>

        ${this.generateAutresRetenuesSection(retenues.autresRetenues.rubriques)}

        <div class="total-retenues">
            <strong>TOTAL RETENUES: ${this.formatMontant(retenues.totalRetenues)} FCFA</strong>
        </div>
    </div>
    `
  }

  /**
   * Génère la section éléments non imposables et retenus (Bloc 3)
   */
  private static generateElementsNonImposablesSection(template: BulletinTemplate): string {
    const { gains, retenues } = template.bulletin

    // Récupérer les gains non soumis (5xxx) et les éléments non imposables (9xxx)
    const gainsNonSoumis = gains.rubriques.filter(r => r.type === 'GAIN_NON_SOUMIS')
    const elementsNonImposables = retenues.autresRetenues.rubriques.filter(r => r.type === 'ELEMENT_NON_IMPOSABLE')

    console.log('📄 DEBUG Generator - Gains non soumis:', gainsNonSoumis.length)
    console.log('📄 DEBUG Generator - Éléments non imposables:', elementsNonImposables.length)
    console.log('📄 DEBUG Generator - Détail éléments non imposables:', elementsNonImposables.map(r => ({ code: r.code, libelle: r.libelle, montant: r.montant, type: r.type })))

    // Combiner dans l'ordre : gains non soumis (5xxx) puis éléments non imposables (9xxx)
    const allElements = [...gainsNonSoumis, ...elementsNonImposables]

    if (allElements.length === 0) {
      console.log('⚠️ DEBUG Generator - Aucun élément dans le bloc 3')
      return ''
    }

    return `
    <div class="elements-non-imposables-section">
        <h3>ÉLÉMENTS NON IMPOSABLES ET RETENUS</h3>
        <table class="rubriques-table">
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Libellé</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                ${allElements.map(r => `
                <tr>
                    <td>${r.code}</td>
                    <td>${r.libelle}</td>
                    <td class="montant">${this.formatMontant(r.montant)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `
  }

  /**
   * Génère la section charges employeur (optionnelle)
   */
  private static generateChargesSection(template: BulletinTemplate): string {
    if (!template.options.afficherChargesEmployeur) return ''

    const { chargesEmployeur } = template.bulletin

    return `
    <div class="charges-section">
        <h3>CHARGES EMPLOYEUR</h3>
        <table class="rubriques-table">
            <thead>
                <tr>
                    <th>Libellé</th>
                    <th>Base</th>
                    <th>Taux</th>
                    <th>Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>CNSS Employeur</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>16.00%</td>
                    <td class="montant">${this.formatMontant(chargesEmployeur.cnss)}</td>
                </tr>
                <tr>
                    <td>Allocations familiales</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>10.03%</td>
                    <td class="montant">${this.formatMontant(chargesEmployeur.allocationsFamiliales)}</td>
                </tr>
                <tr>
                    <td>Accidents de travail</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>2.25%</td>
                    <td class="montant">${this.formatMontant(chargesEmployeur.accidentsTravail)}</td>
                </tr>
                <tr>
                    <td>SS - Taxe unique</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>3.375%</td>
                    <td class="montant">${this.formatMontant(chargesEmployeur.taxeUniqueSS)}</td>
                </tr>
                <tr>
                    <td>TUS</td>
                    <td>${this.formatMontant(template.bulletin.gains.totalBrutSocial)}</td>
                    <td>4.125%</td>
                    <td class="montant">${this.formatMontant(chargesEmployeur.tus)}</td>
                </tr>
            </tbody>
        </table>
        <div class="total-charges">
            <strong>TOTAL CHARGES EMPLOYEUR: ${this.formatMontant(chargesEmployeur.total)} FCFA</strong>
        </div>
    </div>
    `
  }

  /**
   * Génère les autres retenues (exclut les éléments non imposables)
   */
  private static generateAutresRetenuesSection(rubriques: readonly import('./types').RubriqueEmploye[]): string {
    // Filtrer pour exclure les éléments non imposables (ils sont dans le bloc 3)
    const autresRetenues = rubriques.filter(r => r.type !== 'ELEMENT_NON_IMPOSABLE')

    if (autresRetenues.length === 0) return ''

    return `
    <h4>Autres Retenues</h4>
    <table class="rubriques-table">
        <thead>
            <tr>
                <th>Code</th>
                <th>Libellé</th>
                <th>Montant</th>
            </tr>
        </thead>
        <tbody>
            ${autresRetenues.map(r => `
            <tr>
                <td>${r.code}</td>
                <td>${r.libelle}</td>
                <td class="montant">${this.formatMontant(r.montant)}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    `
  }

  /**
   * Valide le template avant génération
   */
  private static validateTemplate(template: BulletinTemplate): void {
    if (!template.employe?.nom) {
      throw new Error('Nom employé requis')
    }
    if (!template.employe?.prenom) {
      throw new Error('Prénom employé requis')
    }
    if (!template.periode || !/^\d{4}-\d{2}$/.test(template.periode)) {
      throw new Error('Période invalide (format YYYY-MM requis)')
    }
    if (!template.bulletin) {
      throw new Error('Données bulletin requises')
    }
  }

  /**
   * Utilitaire de formatage
   */
  private static formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR')
  }
}