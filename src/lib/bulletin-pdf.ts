import puppeteer from 'puppeteer'

export class BulletinPDFGenerator {
  /**
   * Génère un PDF à partir du HTML
   */
  static async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()

      // Configurer la page pour le format A4
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      })

      // Générer le PDF
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        printBackground: true
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }

  /**
   * Génère un PDF optimisé pour les bulletins de paie
   */
  static async generateBulletinPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    try {
      const page = await browser.newPage()

      // Optimisations pour les bulletins
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      })

      // Configuration spécifique pour les bulletins de paie
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '15px',
          right: '15px',
          bottom: '15px',
          left: '15px'
        },
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false
      })

      return Buffer.from(pdf)
    } finally {
      await browser.close()
    }
  }
}