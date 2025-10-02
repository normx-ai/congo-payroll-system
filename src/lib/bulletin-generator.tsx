import { BulletinData, BulletinResult } from './bulletin-types'
import { BulletinPDFGenerator } from './bulletin-pdf'
import { BulletinPreviewServer } from '@/components/paie/server/BulletinPreviewServer'
import { calculateCurrentCumuls } from '@/components/paie/cumuls-calculator'
import { calculateCongesSync } from './bulletin-generator-helpers'

export class BulletinGenerator {
  /**
   * Génère le HTML complet du bulletin en utilisant les composants React Server
   */
  static async generateBulletinHTML(data: BulletinData): Promise<string> {
    const { calculation, month, year, company } = data

    // Import dynamique de react-dom/server pour éviter l'erreur Next.js
    const { renderToStaticMarkup } = await import('react-dom/server')

    // Calculer les cumuls et congés de manière synchrone pour la génération PDF
    const cumulAnnuel = calculateCurrentCumuls(calculation)
    const conges = calculateCongesSync(
      calculation.employeeData?.dateEmbauche,
      month,
      year
    )

    // Rendre le composant React Server en HTML statique
    const bulletinHTML = renderToStaticMarkup(
      <BulletinPreviewServer
        calculation={calculation}
        month={month}
        year={year}
        company={company}
        cumulAnnuel={cumulAnnuel}
        conges={conges}
      />
    )

    // Créer un document HTML complet avec Tailwind CSS
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-weight: 400;
    }

    * {
      font-weight: 400;
    }

    .font-bold {
      font-weight: 700 !important;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    /* Styles personnalisés pour améliorer le rendu PDF */
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 4px 8px; }
  </style>
</head>
<body>
  ${bulletinHTML}
</body>
</html>
    `.trim()
  }

  /**
   * Génère un bulletin complet (HTML + PDF)
   */
  static async generateBulletin(data: BulletinData): Promise<BulletinResult> {
    const html = await this.generateBulletinHTML(data)
    const pdf = await BulletinPDFGenerator.generateBulletinPDF(html)

    return { html, pdf }
  }
}