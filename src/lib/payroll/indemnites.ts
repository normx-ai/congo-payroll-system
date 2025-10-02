// Calculs des indemnités - Convention Collective Commerce Congo

/**
 * Calcule l'indemnité maternité selon l'article 27
 * @param salaireMensuel - Salaire mensuel avant le départ
 * @param semainesConge - Nombre de semaines de congé maternité (15 standard, jusqu'à 18)
 * @returns Indemnité maternité part employeur (50%)
 *
 * Règles:
 * - Durée standard : 15 semaines (dont 9 après accouchement)
 * - Prolongation possible : +3 semaines si maladie liée
 * - Rémunération : 50% employeur, 50% CNSS
 */
export function calculerIndemniteMaternite(
  salaireMensuel: number,
  semainesConge: number = 15
): number {
  // Part employeur = 50% du salaire
  const tauxEmployeur = 0.50
  // Conversion semaines en mois (4.33 semaines par mois)
  const moisConge = semainesConge / 4.33
  // Calcul de l'indemnité totale
  const indemnite = salaireMensuel * tauxEmployeur * moisConge
  return Math.round(indemnite)
}

/**
 * Calcule l'indemnité de départ à la retraite selon l'article 23
 * @param salaireMensuel - Dernier salaire mensuel
 * @param anneesAnciennete - Nombre d'années d'ancienneté
 * @returns Indemnité de départ à la retraite
 *
 * Règles:
 * - Moins de 10 ans : 5 mois de salaire
 * - 10 ans et plus : 7 mois de salaire
 */
export function calculerIndemniteRetraite(
  salaireMensuel: number,
  anneesAnciennete: number
): number {
  const nombreMois = anneesAnciennete < 10 ? 5 : 7
  return Math.round(salaireMensuel * nombreMois)
}

/**
 * Calcule l'indemnité de licenciement pour compression de personnel selon l'article 22
 * @param salaireMoyen12Mois - Moyenne des 12 derniers mois de salaire
 * @param anneesAnciennete - Nombre d'années d'ancienneté
 * @returns Indemnité de licenciement pour compression
 *
 * Conditions:
 * - Ancienneté minimale : 1 an de présence
 * - Motifs : diminution d'activité ou réorganisation
 * - Montant : 15% de la moyenne des 12 derniers mois × années d'ancienneté
 */
export function calculerIndemniteLicenciementCompression(
  salaireMoyen12Mois: number,
  anneesAnciennete: number
): number {
  // Condition : ancienneté minimale de 1 an
  if (anneesAnciennete < 1) {
    return 0
  }

  // 15% de la moyenne des 12 derniers mois × années d'ancienneté
  const indemnite = salaireMoyen12Mois * 0.15 * anneesAnciennete
  return Math.round(indemnite)
}

/**
 * Calcule l'indemnité de licenciement standard selon l'article 21
 * @param salaireMoyen12Mois - Moyenne des 12 derniers mois de salaire
 * @param moisAnciennete - Nombre de mois d'ancienneté
 * @returns Indemnité de licenciement standard
 *
 * Conditions:
 * - Ancienneté minimale : 18 mois de service effectif
 * - Motifs : licenciement pour motif autre que compression
 * - Barème progressif :
 *   • 1-6 ans : 30% de la moyenne des 12 derniers mois × années
 *   • 7-12 ans : 38% de la moyenne des 12 derniers mois × années
 *   • 13-20 ans : 44% de la moyenne des 12 derniers mois × années
 *   • 21 ans et plus : 50% de la moyenne des 12 derniers mois × années
 */
export function calculerIndemniteLicenciement(
  salaireMoyen12Mois: number,
  moisAnciennete: number
): number {
  // Condition : ancienneté minimale de 18 mois
  if (moisAnciennete < 18) {
    return 0
  }

  const anneesAnciennete = Math.floor(moisAnciennete / 12)
  let taux: number

  // Barème progressif selon l'ancienneté
  if (anneesAnciennete <= 6) {
    taux = 0.30  // 30% pour 1-6 ans
  } else if (anneesAnciennete <= 12) {
    taux = 0.38  // 38% pour 7-12 ans
  } else if (anneesAnciennete <= 20) {
    taux = 0.44  // 44% pour 13-20 ans
  } else {
    taux = 0.50  // 50% pour 21 ans et plus
  }

  const indemnite = salaireMoyen12Mois * taux * anneesAnciennete
  return Math.round(indemnite)
}

/**
 * Calcule la prime de fin d'année selon l'article 45
 * @param salaireBase - Salaire de base de l'employé (convention uniquement)
 * @param moisAnciennete - Nombre de mois d'ancienneté
 * @param dateEmbauche - Date d'embauche (pour vérifier embauche au 1er trimestre)
 * @param aSanctions - Si l'employé a des sanctions confirmées par l'inspecteur du travail
 * @returns Montant de la prime de fin d'année
 */
export function calculerPrimeFinAnnee(
  salaireBase: number,
  moisAnciennete: number,
  dateEmbauche: Date,
  aSanctions: boolean = false
): number {
  // Condition : ancienneté minimale de 12 mois
  if (moisAnciennete < 12) {
    return 0
  }

  // Si sanctions confirmées par inspecteur du travail
  if (aSanctions) {
    return 0 // Prime supprimée (ou réduite selon décision)
  }

  let montantPrime = salaireBase

  // Vérifier si embauché au cours du 1er trimestre (janvier à mars)
  const anneeActuelle = new Date().getFullYear()
  const debutAnnee = new Date(anneeActuelle, 0, 1) // 1er janvier
  const finTrimestre1 = new Date(anneeActuelle, 2, 31) // 31 mars

  if (dateEmbauche >= debutAnnee && dateEmbauche <= finTrimestre1) {
    // Prorata temporis : calculer la fraction de l'année travaillée
    const moisTravaillesAnneeActuelle = 12 - dateEmbauche.getMonth()
    montantPrime = Math.round(salaireBase * (moisTravaillesAnneeActuelle / 12))
  }

  return montantPrime
}