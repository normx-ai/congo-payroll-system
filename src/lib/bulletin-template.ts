import { PayrollCalculation } from './payroll'
import { BulletinData } from './bulletin-types'

export class BulletinTemplate {
  /**
   * Génère le CSS pour le bulletin PDF
   */
  static generateCSS(): string {
    return `
      body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; background: white; }
      .bulletin-container { max-width: 800px; margin: 0 auto; border: 1px solid #000; }
      .header { padding: 10px; border-bottom: 1px solid #000; }
      .company-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
      .employee-info { margin-top: 10px; }
      .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      .table th, .table td { border: 1px solid #000; padding: 4px 6px; text-align: left; font-size: 10px; }
      .table th { background: #f0f0f0; font-weight: bold; text-align: center; }
      .number { text-align: right; }
      .total-row { font-weight: bold; background: #f9f9f9; }
      .footer { padding: 10px; border-top: 1px solid #000; font-size: 10px; }
      .signature { margin-top: 20px; display: flex; justify-content: space-between; }
    `
  }

  /**
   * Génère l'en-tête du bulletin
   */
  static generateHeader(data: BulletinData): string {
    const { calculation, month, year, company } = data
    const periodStart = `01/${month}/${year}`
    const periodEnd = new Date(parseInt(year), parseInt(month), 0).getDate() + `/${month}/${year}`

    return `
      <div class="header">
        <div class="company-info">
          <div>
            <strong>${company.name}</strong><br>
            ${company.address}<br>
            ${company.city}<br>
            ${company.niu ? `N.I.U: ${company.niu}` : ''}
          </div>
          <div style="text-align: right;">
            <strong>BULLETIN DE SALAIRE</strong><br>
            Période: ${periodStart} au ${periodEnd}
          </div>
        </div>

        <div class="employee-info">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Nom:</strong> ${calculation.lastName}<br>
              <strong>Prénom:</strong> ${calculation.firstName}<br>
              <strong>Matricule:</strong> ${calculation.employeeCode}<br>
              <strong>Poste:</strong> ${calculation.position}
            </div>
            <div style="text-align: right;">
              <strong>Embauche:</strong> ${calculation.employeeData?.dateEmbauche || ''}<br>
              <strong>CNSS:</strong> ${calculation.employeeData?.numeroCNSS || ''}<br>
              <strong>Ancienneté:</strong> ${calculation.employeeData?.anciennete || ''}<br>
              <strong>Enfants:</strong> ${calculation.employeeData?.nombreEnfants || 0}
            </div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Formate un nombre pour l'affichage
   */
  static formatNumber(num: number): string {
    if (num === 0) return '0'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(num))
  }

  /**
   * Génère les lignes du tableau des rubriques
   */
  static generateRubriquesRows(calculation: PayrollCalculation): string {
    let rows = ''

    // Gains
    calculation.rubriques.gains.forEach(gain => {
      rows += `
        <tr>
          <td>${gain.code}</td>
          <td>${gain.designation}</td>
          <td class="number">${gain.quantite || ''}</td>
          <td class="number">${gain.taux || ''}</td>
          <td class="number">${gain.base ? this.formatNumber(gain.base) : ''}</td>
          <td class="number">${this.formatNumber(gain.montant)}</td>
          <td class="number">-</td>
        </tr>
      `
    })

    // Retenues
    calculation.rubriques.retenues.forEach(retenue => {
      rows += `
        <tr>
          <td>${retenue.code}</td>
          <td>${retenue.designation}</td>
          <td class="number">-</td>
          <td class="number">${retenue.taux || ''}</td>
          <td class="number">${retenue.base ? this.formatNumber(retenue.base) : ''}</td>
          <td class="number">-</td>
          <td class="number">${this.formatNumber(retenue.montant)}</td>
        </tr>
      `
    })

    return rows
  }

  /**
   * Génère le pied de page du bulletin
   */
  static generateFooter(calculation: PayrollCalculation): string {
    return `
      <div class="footer">
        <div style="margin-bottom: 10px;">
          <strong>Coût total employeur:</strong> ${this.formatNumber(calculation.totalGains + calculation.cotisationsEmployeur)} F CFA
        </div>

        <div class="signature">
          <div>
            <p>Signature de l'employé</p>
            <div style="border-top: 1px solid #000; width: 150px; height: 40px; margin-top: 10px;"></div>
          </div>
          <div>
            <p>Signature de l'employeur</p>
            <div style="border-top: 1px solid #000; width: 150px; height: 40px; margin-top: 10px;"></div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; font-size: 9px; color: #666;">
          Bulletin généré le ${new Date().toLocaleDateString('fr-FR')} -
          Document confidentiel à conserver
        </div>
      </div>
    `
  }
}