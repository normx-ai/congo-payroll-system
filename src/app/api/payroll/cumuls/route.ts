import { NextRequest, NextResponse } from 'next/server'
import { handleCatchError } from '@/lib/error-handler'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year')
    const currentMonth = searchParams.get('currentMonth')

    if (!employeeId || !year || !currentMonth) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Récupérer tous les bulletins des mois précédents (AVANT le mois actuel)
    const bulletins = await prisma.bulletinPaie.findMany({
      where: {
        employeeId,
        year: parseInt(year),
        month: {
          lt: parseInt(currentMonth) // Strictement inférieur (pas le mois actuel)
        }
      },
      orderBy: {
        month: 'asc'
      }
    })

    // Calculer les cumuls
    const cumuls = {
      salaireBrut: 0,
      netImposable: 0,
      chargesSalariales: 0,
      chargesPatronales: 0,
      basConges: 0,
      irpp: 0,
      tol: 0
    }

    type RubriqueData = {
      code?: string
      type?: string
      montant?: number
    }

    type BulletinData = {
      rubriques?: {
        gains?: RubriqueData[]
        retenues?: RubriqueData[]
      }
    }

    bulletins.forEach(bulletin => {
      if (bulletin.dataJson && typeof bulletin.dataJson === 'object') {
        const data = bulletin.dataJson as BulletinData

        // Calculer le salaire brut (tous les gains bruts)
        const salaireBrutMensuel = data.rubriques?.gains
          ?.filter((g) => g.type === 'GAIN_BRUT')
          ?.reduce((sum, g) => sum + (g.montant || 0), 0) || 0

        cumuls.salaireBrut += salaireBrutMensuel

        // Calculer la CNSS salariale
        const cnssTotal = data.rubriques?.retenues
          ?.filter((r) => r.code === '3100')
          ?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0
        const cnssSalariale = cnssTotal * (4/12)

        // Net imposable = (Brut - CNSS 4%) × 80%
        const revenuApresCNSS = salaireBrutMensuel - cnssSalariale
        cumuls.netImposable += revenuApresCNSS * 0.80

        // Charges salariales (CNSS 4% + IRPP + CAMU + TOL)
        const irpp = data.rubriques?.retenues
          ?.filter((r) => r.code === '3510')
          ?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0
        const camu = data.rubriques?.retenues
          ?.filter((r) => r.code === '3540')
          ?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0
        const tol = data.rubriques?.retenues
          ?.filter((r) => r.code === '3550')
          ?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0

        cumuls.chargesSalariales += cnssSalariale + irpp + camu + tol
        cumuls.irpp += irpp
        cumuls.tol += tol

        // Charges patronales (CNSS 8% + AT + PF + Retraites)
        const cnssPatronale = cnssTotal * (8/12)
        const autresChargesPatronales = data.rubriques?.retenues
          ?.filter((r) => ['3110', '3120', '3530', '3130', '3560', '3570'].includes(r.code || ''))
          ?.reduce((sum, r) => sum + (r.montant || 0), 0) || 0

        cumuls.chargesPatronales += cnssPatronale + autresChargesPatronales

        // Base congés = salaire brut
        cumuls.basConges += salaireBrutMensuel
      }
    })

    return NextResponse.json({ cumuls })
  } catch (error) {
    return handleCatchError(error)
  }
}