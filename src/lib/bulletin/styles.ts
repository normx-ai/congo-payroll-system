/**
 * Styles CSS pour bulletins de paie - Format Congo
 * Fichier: <150 lignes
 */

/**
 * Générateur de styles CSS pour bulletins
 */
export class BulletinStyles {

  /**
   * CSS complet pour bulletin Congo Professionnel
   */
  static getCSS(): string {
    return `
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 15px;
            font-size: 10px;
            line-height: 1.2;
        }
        .bulletin-container {
            max-width: 850px;
            margin: 0 auto;
            border: 2px solid #000;
        }

        /* EN-TÊTE */
        .header {
            border-bottom: 2px solid #000;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
        }
        .bulletin-title-cell {
            width: 40%;
            text-align: center;
            border-right: 1px solid #000;
            padding: 8px;
        }
        .bulletin-main-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
        }
        .code-cell {
            width: 10%;
            text-align: center;
            border-right: 1px solid #000;
            padding: 8px;
            font-weight: bold;
        }
        .periode-cell {
            width: 50%;
            text-align: center;
            padding: 8px;
        }
        .periode-info {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .periode-label {
            font-size: 12px;
            font-weight: bold;
        }
        .periode-dates {
            margin-top: 5px;
        }
        .periode-title {
            font-weight: bold;
        }

        .entreprise-section {
            padding: 10px;
            border-bottom: 1px solid #000;
        }
        .entreprise-left {
            float: left;
            width: 50%;
        }
        .entreprise-name {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .entreprise-address {
            font-size: 9px;
            margin-bottom: 5px;
        }
        .entreprise-nui {
            font-size: 9px;
            font-weight: bold;
        }

        /* INFORMATIONS EMPLOYÉ */
        .employee-section {
            border-bottom: 2px solid #000;
        }
        .employee-info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .employee-left, .employee-right {
            width: 50%;
            padding: 8px;
            vertical-align: top;
            border-right: 1px solid #000;
        }
        .employee-right {
            border-right: none;
        }
        .employee-field {
            margin: 3px 0;
            font-size: 9px;
        }
        .employee-field .label {
            font-weight: bold;
        }

        .employee-name-section {
            border-top: 1px solid #000;
            padding: 8px;
            text-align: center;
        }
        .employee-name-label {
            font-size: 10px;
            font-weight: bold;
        }
        .employee-name {
            font-size: 14px;
            font-weight: bold;
            margin: 5px 0;
        }
        .employee-location {
            font-size: 10px;
        }

        /* RUBRIQUES PRINCIPALES */
        .rubriques-section {
            border-bottom: 2px solid #000;
        }
        .rubriques-main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
        }
        .rubriques-main-table th, .rubriques-main-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
        }
        .rubriques-main-table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .col-numero { width: 8%; }
        .col-designation { width: 35%; text-align: left; }
        .col-nombre { width: 8%; }
        .col-base { width: 12%; }
        .col-taux { width: 8%; }
        .col-gain, .col-retenue { width: 12%; }

        .sub-header th {
            background: #e0e0e0;
            font-size: 7px;
        }

        .rubrique-line td {
            font-size: 8px;
        }
        .total-line td {
            font-weight: bold;
            background: #f5f5f5;
        }

        /* RÉCAPITULATIF */
        .summary-section {
            padding: 10px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .summary-table td {
            border: 1px solid #000;
            padding: 8px;
        }
        .net-amount {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
        }

        /* SECTIONS RETENUES, CHARGES, ÉLÉMENTS NON IMPOSABLES */
        .retenues-section, .charges-section, .elements-non-imposables-section {
            padding: 10px;
            border-bottom: 2px solid #000;
        }
        .retenues-section h3, .charges-section h3, .elements-non-imposables-section h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        .retenues-section h4, .charges-section h4 {
            margin: 10px 0 5px 0;
            font-size: 10px;
        }
        .rubriques-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 10px;
        }
        .rubriques-table th, .rubriques-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
        }
        .rubriques-table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        .total-retenues, .total-charges {
            text-align: right;
            margin-top: 10px;
        }

        /* PIED DE PAGE */
        .footer {
            border-top: 2px solid #000;
            padding: 10px;
        }
        .footer-message {
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .montant {
            text-align: right;
            font-weight: bold;
        }

        .label {
            font-weight: bold;
        }

        /* Clearfix */
        .entreprise-section:after {
            content: "";
            display: table;
            clear: both;
        }
    `
  }
}