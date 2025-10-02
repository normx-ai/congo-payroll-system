// Calculs liés à l'ancienneté - Convention Collective Commerce Congo

/**
 * Calcule la prime d'ancienneté selon l'article 41 de la convention collective
 * @param salaireBase - Salaire de base de l'employé (convention uniquement, sans sursalaire)
 * @param anneesAnciennete - Nombre d'années d'ancienneté
 * @returns Montant de la prime d'ancienneté
 *
 * Règles:
 * - Moins de 2 ans : 0%
 * - 2 ans : 2%
 * - 3 à 29 ans : 1% par année (3% à 3 ans, 4% à 4 ans... plafonné à 25%)
 * - 30 ans et plus : 30%
 */
export function calculerPrimeAnciennete(salaireBase: number, anneesAnciennete: number): number {
  // Moins de 2 ans : pas de prime
  if (anneesAnciennete < 2) {
    return 0
  }

  // 2 ans : 2%
  if (anneesAnciennete === 2) {
    return Math.round(salaireBase * 0.02)
  }

  // 30 ans et plus : 30%
  if (anneesAnciennete >= 30) {
    return Math.round(salaireBase * 0.30)
  }

  // Entre 3 et 29 ans : 1% par année, plafonné à 25%
  const taux = Math.min(anneesAnciennete, 25) / 100
  return Math.round(salaireBase * taux)
}

/**
 * Calcule les jours de congés supplémentaires selon l'article 35
 * @param anneesAnciennete - Nombre d'années d'ancienneté
 * @returns Nombre de jours de congés supplémentaires
 */
export function calculerCongesSupplementaires(anneesAnciennete: number): number {
  if (anneesAnciennete < 3) return 0
  if (anneesAnciennete < 5) return 3
  if (anneesAnciennete < 10) return 5
  if (anneesAnciennete < 15) return 6
  if (anneesAnciennete < 20) return 8
  if (anneesAnciennete < 25) return 9
  if (anneesAnciennete < 30) return 10
  return 15 // 30 ans et plus
}

/**
 * Calcule le total des jours de congés payés
 * @param anneesAnciennete - Nombre d'années d'ancienneté
 * @returns Total jours de congés (base + supplémentaires)
 */
export function calculerTotalJoursConges(anneesAnciennete: number): number {
  const congesBase = 26 // 26 jours ouvrables par an (loi congolaise)
  const congesSupplementaires = calculerCongesSupplementaires(anneesAnciennete)
  return congesBase + congesSupplementaires
}

/**
 * Calcule l'allocation de congé selon l'article 36
 * @param salaireMoyenMensuel - Moyenne des 12 derniers mois (salaire brut)
 * @param joursConges - Nombre de jours de congés à prendre
 * @returns Montant de l'allocation de congé
 */
export function calculerAllocationConge(
  salaireMoyenMensuel: number,
  joursConges: number
): number {
  // Allocation = (salaire moyen / 26 jours ouvrables) × jours de congés
  const tauxJournalier = salaireMoyenMensuel / 26
  return Math.round(tauxJournalier * joursConges)
}

/**
 * Calcule les droits de congés acquis selon l'article 34
 * @param moisTravailles - Nombre de mois travaillés dans l'année
 * @returns Nombre de jours de congés acquis
 */
export function calculerCongesAcquis(moisTravailles: number): number {
  // 2.16 jours par mois travaillé (26 jours / 12 mois)
  return Math.round(moisTravailles * 2.16)
}

/**
 * Vérifie si l'employé peut prendre ses congés
 * @param moisAnciennete - Nombre de mois d'ancienneté
 * @returns true si l'employé peut prendre ses congés (≥ 12 mois)
 */
export function peutPrendreConges(moisAnciennete: number): boolean {
  return moisAnciennete >= 12
}