import { prisma } from '@/lib/prisma'

export interface TrancheIrpp {
  ordre: number
  seuil_min: number
  seuil_max: number | null
  taux: number
  description: string
}

/**
 * Service d'accès au barème IRPP depuis la base de données
 */
export class BaremeIrppService {
  /**
   * Récupère le barème IRPP pour une période donnée
   */
  static async getBareme(
    tenantId: string,
    periode: Date = new Date()
  ): Promise<TrancheIrpp[]> {
    const tranches = await prisma.irppTranche.findMany({
      where: {
        tenantId,
        isActive: true,
        dateEffet: { lte: periode },
        OR: [
          { dateFin: null },
          { dateFin: { gte: periode } }
        ]
      },
      orderBy: { ordre: 'asc' }
    })

    if (tranches.length === 0) {
      throw new Error(`Barème IRPP non trouvé pour la période ${periode.toISOString()}`)
    }

    return tranches.map(t => ({
      ordre: t.ordre,
      seuil_min: Number(t.seuil_min),
      seuil_max: t.seuil_max ? Number(t.seuil_max) : null,
      taux: Number(t.taux),
      description: t.description
    }))
  }

  /**
   * Calcule l'IRPP selon le barème progressif depuis la DB
   */
  static async calculateIrpp(
    tenantId: string,
    revenuImposable: number,
    chargesDeductibles: number = 0,
    quotientFamilial: number = 1,
    periode: Date = new Date()
  ): Promise<{
    revenuNet: number
    revenuParPart: number
    irppParPart: number
    irppTotal: number
    details: Array<{ tranche: TrancheIrpp; baseImposable: number; impot: number }>
  }> {
    const bareme = await this.getBareme(tenantId, periode)

    const revenuNet = Math.max(0, revenuImposable - chargesDeductibles)
    const revenuParPart = revenuNet / quotientFamilial

    if (revenuParPart === 0) {
      return {
        revenuNet: 0,
        revenuParPart: 0,
        irppParPart: 0,
        irppTotal: 0,
        details: []
      }
    }

    const details: Array<{ tranche: TrancheIrpp; baseImposable: number; impot: number }> = []
    let irppParPart = 0
    let baseRestante = revenuParPart

    for (const tranche of bareme) {
      if (baseRestante <= 0) break

      const montantTranche = Math.min(
        baseRestante,
        tranche.seuil_max === null
          ? baseRestante
          : Math.max(0, tranche.seuil_max - Math.max(tranche.seuil_min - 1, 0))
      )

      if (montantTranche > 0 && revenuParPart > tranche.seuil_min - 1) {
        const baseImposableTranche = Math.min(
          montantTranche,
          Math.max(0, revenuParPart - (tranche.seuil_min - 1))
        )
        const impotTranche = baseImposableTranche * (tranche.taux / 100)

        details.push({
          tranche,
          baseImposable: baseImposableTranche,
          impot: impotTranche
        })

        irppParPart += impotTranche
        baseRestante -= baseImposableTranche
      }
    }

    const irppTotal = irppParPart * quotientFamilial

    return {
      revenuNet,
      revenuParPart,
      irppParPart: Math.round(irppParPart),
      irppTotal: Math.round(irppTotal),
      details
    }
  }
}
