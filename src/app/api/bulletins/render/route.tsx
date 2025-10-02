import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PayrollCalculation } from '@/lib/payroll'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { calculation, month, year, employeeId, company } = await req.json()

    // Utilisation dynamique de renderToStaticMarkup pour éviter l'erreur de build
    const { renderToStaticMarkup } = await import('react-dom/server')
    const { createElement } = await import('react')
    const { BulletinPreview } = await import('@/components/paie/BulletinPreview')

    // Rendre le composant React en HTML statique
    const bulletinHTML = renderToStaticMarkup(
      createElement(BulletinPreview, {
        calculation: calculation as PayrollCalculation,
        month,
        year,
        employeeId,
        company
      })
    )

    // Créer un document HTML complet avec Tailwind CSS
    const fullHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulletin de Paie</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
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

    return new NextResponse(fullHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    })
  } catch (error) {
    console.error('Error rendering bulletin:', error)
    return NextResponse.json(
      { error: 'Erreur lors du rendu du bulletin' },
      { status: 500 }
    )
  }
}