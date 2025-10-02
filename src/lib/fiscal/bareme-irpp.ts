/**
 * Barème IRPP Congo - Code Général des Impôts Article 95
 */

export interface TrancheIrpp {
  readonly min: number
  readonly max: number
  readonly taux: number // En pourcentage
  readonly description: string
}

/**
 * Barème IRPP officiel Congo - Article 95 du CGI
 * Application du barème progressif selon la formule :
 * Revenu net imposable (pour une part) × Taux du barème progressif = IRPP à payer (pour une part)
 */
export const BAREME_IRPP_CGI: readonly TrancheIrpp[] = [
  {
    min: 0,
    max: 464000,
    taux: 1,
    description: "Pour la fraction de revenu n'excédant pas 464.000 FCFA"
  },
  {
    min: 464001,
    max: 1000000,
    taux: 10,
    description: "Pour la fraction comprise entre 464.001 et 1.000.000 FCFA"
  },
  {
    min: 1000001,
    max: 3000000,
    taux: 25,
    description: "Pour la fraction comprise entre 1.000.001 et 3.000.000 FCFA"
  },
  {
    min: 3000001,
    max: Infinity,
    taux: 40,
    description: "Pour la fraction au-dessus de 3.000.000 FCFA"
  }
] as const

// Alias pour compatibilité
export type TrancheIRPP = TrancheIrpp

/**
 * Calcule l'IRPP par part
 */
export function calculerIRPPParPart(revenuParPart: number): number {
  const result = calculateIrppCgi(revenuParPart)
  return result.irppParPart
}

/**
 * Calcule le détail par tranches
 */
export function calculerDetailTranches(revenuParPart: number) {
  const result = calculateIrppCgi(revenuParPart)
  return result.details
}

/**
 * Calcule l'IRPP selon le barème progressif CGI Article 95
 */
export function calculateIrppCgi(
  revenuImposable: number,
  chargesDeductibles: number = 0,
  quotientFamilial: number = 1
): {
  revenuNet: number
  revenuParPart: number
  irppParPart: number
  irppTotal: number
  details: Array<{ tranche: TrancheIrpp; baseImposable: number; impot: number }>
} {
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

  for (const tranche of BAREME_IRPP_CGI) {
    if (baseRestante <= 0) break

    const montantTranche = Math.min(
      baseRestante,
      tranche.max === Infinity ? baseRestante : Math.max(0, tranche.max - Math.max(tranche.min - 1, 0))
    )

    if (montantTranche > 0 && revenuParPart > tranche.min - 1) {
      const baseImposableTranche = Math.min(montantTranche, Math.max(0, revenuParPart - (tranche.min - 1)))
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

/**
 * Calcule le quotient familial selon Article 91 CGI
 */
export function calculateQuotientFamilial(
  situationFamiliale: 'celibataire' | 'marie' | 'veuf' | 'divorce',
  nombreEnfants: number
): number {
  let parts = 0

  // Parts selon situation familiale
  switch (situationFamiliale) {
    case 'celibataire':
    case 'divorce':
      parts = 1
      break
    case 'marie':
    case 'veuf':
      parts = 2
      break
  }

  // Parts supplémentaires pour enfants à charge
  if (nombreEnfants > 0) {
    if (nombreEnfants <= 2) {
      parts += nombreEnfants * 0.5 // 0,5 part par enfant pour les 2 premiers
    } else {
      parts += 1 // 0,5 × 2 pour les 2 premiers
      parts += (nombreEnfants - 2) * 1 // 1 part par enfant à partir du 3ème
    }
  }

  return parts
}

/**
 * Calcul IRPP complet avec quotient familial
 */
export function calculateIrppComplet(
  revenuImposable: number,
  chargesDeductibles: number = 0,
  situationFamiliale: 'celibataire' | 'marie' | 'veuf' | 'divorce' = 'celibataire',
  nombreEnfants: number = 0
) {
  const quotientFamilial = calculateQuotientFamilial(situationFamiliale, nombreEnfants)

  return {
    quotientFamilial,
    ...calculateIrppCgi(revenuImposable, chargesDeductibles, quotientFamilial)
  }
}