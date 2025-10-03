import puppeteer, { Browser } from 'puppeteer'

// Pool de navigateurs partagés pour améliorer les performances
let browserInstance: Browser | null = null
let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  // Si un navigateur est en cours de lancement, attendre
  if (browserPromise) {
    return browserPromise
  }

  // Si le navigateur existe et est connecté, le retourner
  if (browserInstance?.connected) {
    return browserInstance
  }

  // Lancer un nouveau navigateur
  browserPromise = puppeteer.launch({
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

  browserInstance = await browserPromise
  browserPromise = null

  // Gérer la fermeture propre du navigateur
  browserInstance.on('disconnected', () => {
    browserInstance = null
  })

  return browserInstance
}

export class BulletinPDFGenerator {
  /**
   * Génère un PDF à partir du HTML
   */
  static async generatePDF(html: string): Promise<Buffer> {
    const browser = await getBrowser()
    const page = await browser.newPage()

    try {
      // Configurer la page pour le format A4
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
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
      await page.close()
    }
  }

  /**
   * Génère un PDF optimisé pour les bulletins de paie (réutilise le navigateur)
   */
  static async generateBulletinPDF(html: string): Promise<Buffer> {
    const browser = await getBrowser()
    const page = await browser.newPage()

    try {
      // Désactiver uniquement les images et médias pour accélérer (garder les styles)
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        if (['image', 'media'].includes(req.resourceType())) {
          req.abort()
        } else {
          req.continue()
        }
      })

      // Optimisations pour les bulletins - Augmenter timeout et utiliser domcontentloaded uniquement
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
        timeout: 60000 // 60 secondes au lieu de 30
      })

      // Attendre un peu pour s'assurer que le rendu est terminé (méthode compatible)
      await new Promise(resolve => setTimeout(resolve, 300))

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
      await page.close()
    }
  }

  /**
   * Ferme le navigateur partagé (utile pour le nettoyage)
   */
  static async closeBrowser(): Promise<void> {
    if (browserInstance) {
      await browserInstance.close()
      browserInstance = null
    }
  }
}