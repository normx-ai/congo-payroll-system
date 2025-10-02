// Gestion des exonérations fiscales - Article 38 CGI Congo

/**
 * Interface pour les primes non imposables (PNI)
 */
export interface PrimeNonImposable {
  code: string
  montant: number
}

/**
 * Calcule l'exonération fiscale des primes non imposables selon l'Article 38 CGI
 * @param salaireBrut - Salaire brut de l'employé
 * @param primesNonImposables - Liste des primes non imposables avec leurs montants
 * @returns Objet avec le montant exonéré et le montant imposable
 *
 * Règle Article 38 CGI:
 * - Les primes non imposables (PNI) sont exonérées dans la limite de 15% du salaire brut
 * - Si la somme des PNI > 15% du salaire brut, l'excédent devient imposable
 * - L'excédent est ajouté à l'assiette IRPP
 */
export function calculerExonerationPrimesNonImposables(
  salaireBrut: number,
  primesNonImposables: PrimeNonImposable[]
): {
  montantTotalPNI: number
  plafondExoneration: number
  montantExonere: number
  montantImposable: number
} {
  // Calculer le total des primes non imposables
  const montantTotalPNI = primesNonImposables.reduce((total, prime) => total + prime.montant, 0)

  // Plafond d'exonération = 15% du salaire brut
  const plafondExoneration = Math.round(salaireBrut * 0.15)

  // Montant exonéré = minimum entre total PNI et plafond
  const montantExonere = Math.min(montantTotalPNI, plafondExoneration)

  // Montant imposable = excédent au-dessus du plafond
  const montantImposable = Math.max(0, montantTotalPNI - plafondExoneration)

  return {
    montantTotalPNI,
    plafondExoneration,
    montantExonere,
    montantImposable
  }
}

/**
 * Vérifie si un code rubrique correspond à une prime non imposable (Article 38)
 * @param codeRubrique - Code de la rubrique (ex: "5010", "5020", etc.)
 * @returns true si c'est une prime non imposable selon Article 38
 */
export function estPrimeNonImposableArticle38(codeRubrique: string): boolean {
  // Codes 50xx = primes non imposables selon Article 38 CGI
  return codeRubrique.startsWith('50')
}

/**
 * Calcule l'assiette IRPP en tenant compte des exonérations Article 38
 * @param salaireBrut - Salaire brut de base
 * @param gainsImposables - Montant total des gains imposables (codes 01xx-04xx)
 * @param primesNonImposables - Liste des primes non imposables avec leurs montants
 * @param cotisationsSociales - Total des cotisations sociales déductibles
 * @returns Assiette IRPP après application des règles d'exonération
 */
export function calculerAssietteiRPP(
  salaireBrut: number,
  gainsImposables: number,
  primesNonImposables: PrimeNonImposable[],
  cotisationsSociales: number
): {
  salaireBrutTotal: number
  exonerationPNI: ReturnType<typeof calculerExonerationPrimesNonImposables>
  salaireImposable: number
  abattementForFaitaire: number
  assietteIRPP: number
} {
  // Salaire brut total = salaire de base + gains imposables
  const salaireBrutTotal = salaireBrut + gainsImposables

  // Calcul de l'exonération des primes non imposables
  const exonerationPNI = calculerExonerationPrimesNonImposables(salaireBrutTotal, primesNonImposables)

  // Salaire imposable = salaire brut total + excédent PNI imposable - cotisations sociales
  const salaireImposable = salaireBrutTotal + exonerationPNI.montantImposable - cotisationsSociales

  // Abattement forfaitaire IRPP = 20% du salaire imposable
  const abattementForFaitaire = Math.round(salaireImposable * 0.20)

  // Assiette IRPP finale
  const assietteIRPP = Math.max(0, salaireImposable - abattementForFaitaire)

  return {
    salaireBrutTotal,
    exonerationPNI,
    salaireImposable,
    abattementForFaitaire,
    assietteIRPP
  }
}