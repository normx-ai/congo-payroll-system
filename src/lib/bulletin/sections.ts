/**
 * Générateurs de sections HTML pour bulletins
 * Fichier: <150 lignes
 */

import { BulletinTemplate } from './types'
import { BulletinFormatters } from './formatters'

/**
 * Générateurs de sections HTML
 */
export class BulletinSections {

  /**
   * Génère l'en-tête entreprise
   */
  static generateHeader(template: BulletinTemplate): string {
    const { entreprise, periode } = template

    return `
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="bulletin-title-cell">
                    <h1 class="bulletin-main-title">BULLETIN DE PAIE</h1>
                </td>
                <td class="code-cell">XAF</td>
                <td class="periode-cell">
                    <div class="periode-info">
                        <div class="periode-label">Original</div>
                        <div class="periode-dates">
                            <span class="periode-title">PAIE DU</span>
                            <span class="periode-value">${BulletinFormatters.formatPeriodeRange(periode)}</span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <div class="entreprise-section">
            <div class="entreprise-left">
                <div class="entreprise-name">${entreprise.nom}</div>
                <div class="entreprise-address">
                    ${entreprise.adresse}<br>
                    Pointe Noire, République du Congo
                </div>
                <div class="entreprise-nui">NIU : ${entreprise.nui || 'Non renseigné'}</div>
            </div>
        </div>
    </div>
    `
  }

  /**
   * Génère les informations employé
   */
  static generateEmployeeInfo(template: BulletinTemplate): string {
    const emp = template.employe
    const anciennete = BulletinFormatters.calculerAnciennete(emp.dateEmbauche)

    return `
    <div class="employee-section">
        <table class="employee-info-table">
            <tr>
                <td class="employee-left">
                    <div class="employee-field"><span class="label">Matricule :</span> ${emp.matricule}</div>
                    <div class="employee-field"><span class="label">Emploi :</span> ${emp.poste}</div>
                    <div class="employee-field"><span class="label">Situation familiale :</span> ${emp.situationFamiliale}</div>
                    <div class="employee-field"><span class="label">Nombre d'enfants :</span> ${emp.enfantsACharge}</div>
                    <div class="employee-field"><span class="label">Nombre de parts :</span> ${BulletinFormatters.calculerParts(emp.situationFamiliale, emp.enfantsACharge)}</div>
                    <div class="employee-field"><span class="label">NIU :</span> ${emp.nui || 'Non renseigné'}</div>
                </td>
                <td class="employee-right">
                    <div class="employee-field"><span class="label">Date d'embauche :</span> ${new Date(emp.dateEmbauche).toLocaleDateString('fr-FR')}</div>
                    <div class="employee-field"><span class="label">Ancienneté :</span> ${anciennete}</div>
                    <div class="employee-field"><span class="label">Qualif. :</span> ${emp.categorie}</div>
                    <div class="employee-field"><span class="label">Coeff :</span> ${emp.echelon}</div>
                    <div class="employee-field"><span class="label">N° CNSS :</span> ${emp.cnssNumero || 'Non renseigné'}</div>
                </td>
            </tr>
        </table>
        <div class="employee-name-section">
            <div class="employee-name-label">INNO B.</div>
            <div class="employee-name">${emp.nom.toUpperCase()}</div>
            <div class="employee-location">CENTRE VILLE<br>POINTE-NOIRE</div>
        </div>
    </div>
    `
  }

  /**
   * Génère le résumé final
   */
  static generateSummary(template: BulletinTemplate): string {
    const bulletin = template.bulletin
    const periode = template.periode

    return `
    <div class="summary-section">
        <table class="summary-table">
            <tr class="summary-header">
                <td class="mode-reglement"><span class="label">Mode de Règlement :</span> Virement</td>
                <td class="net-payer-header">NET À PAYER</td>
            </tr>
            <tr class="summary-amounts">
                <td class="paye-le"><span class="label">Payé Le :</span> ${BulletinFormatters.getDatePaiement(periode)}</td>
                <td class="net-amount">${BulletinFormatters.formatMontant(bulletin.netAPayer)}</td>
            </tr>
        </table>
    </div>
    `
  }

  /**
   * Génère le pied de page
   */
  static generateFooter(): string {
    const now = new Date()
    return `
    <div class="footer">
        <div class="footer-message">
            DANS VOTRE INTÉRÊT ET POUR VOUS AIDER À FAIRE VALOIR VOS DROITS, CONSERVER CE BULLETIN DE PAIE SANS LIMITATION DE DURÉE
        </div>
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-title">L'employeur :</div>
                <div class="signature-space"></div>
            </div>
            <div class="signature-box">
                <div class="signature-title">L'employé :</div>
                <div class="signature-space"></div>
            </div>
        </div>
        <div class="generation-info">
            <p>Bulletin édité le ${now.toLocaleDateString('fr-FR')} - Document généré par NORM_PAIE</p>
        </div>
    </div>
    `
  }

  /**
   * Génère la section gains avec tableau détaillé
   */
  static generateGainsSection(template: BulletinTemplate): string {
    const { gains } = template.bulletin
    const { masquerRubriquesNulles } = template.options

    const rubriques = BulletinFormatters.filterRubriques(gains.rubriques, masquerRubriquesNulles)
    const salaireBase = BulletinFormatters.getSalaireBase(rubriques)

    return `
    <div class="rubriques-section">
        <table class="rubriques-main-table">
            <thead>
                <tr>
                    <th class="col-numero">N°</th>
                    <th class="col-designation">Désignation</th>
                    <th class="col-nombre">Nombre</th>
                    <th class="col-base">Base</th>
                    <th class="col-gain">Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr class="rubrique-line">
                    <td>20</td>
                    <td>SALAIRE DE BASE</td>
                    <td>26,00</td>
                    <td class="montant">${BulletinFormatters.formatMontant(salaireBase)}</td>
                    <td class="montant">${BulletinFormatters.formatMontant(salaireBase)}</td>
                </tr>
                ${this.generateAutresGains(rubriques)}
                <tr class="total-line">
                    <td colspan="4"><strong>Total Brut</strong></td>
                    <td class="montant"><strong>${BulletinFormatters.formatMontant(gains.totalBrutFiscal)}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
    `
  }

  /**
   * Génère les autres gains
   */
  private static generateAutresGains(rubriques: readonly import('./types').RubriqueEmploye[]): string {
    const autresGains = rubriques.filter(r =>
      r.code !== '0100' && !r.libelle.toLowerCase().includes('salaire catégoriel') && !r.libelle.toLowerCase().includes('salaire de base')
    )

    return autresGains.map(r => `
      <tr class="rubrique-line">
          <td>${r.code}</td>
          <td>${r.libelle}</td>
          <td></td>
          <td class="montant">${BulletinFormatters.formatMontant(r.montant || 0)}</td>
          <td class="montant">${BulletinFormatters.formatMontant(r.montant)}</td>
      </tr>
    `).join('')
  }
}