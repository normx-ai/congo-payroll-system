// Calculs des indemnités de déplacement - Article 47 Convention Collective Commerce Congo

import { calculerTauxHoraire, getSalaireConvention } from './salaires'

/**
 * Calcule l'indemnité de déplacement pour prise d'un repas principal
 * @param categorie - Catégorie professionnelle (1-10)
 * @param echelon - Échelon dans la catégorie (1-5)
 * @returns Indemnité pour 1 repas (5 × salaire horaire minimum de la catégorie)
 */
export function calculerIndemniteDeplacementPrincipal(
  categorie: number,
  echelon: number
): number {
  const salaireHoraire = calculerTauxHoraire(getSalaireConvention(categorie, echelon))
  return Math.round(salaireHoraire * 5)
}

/**
 * Calcule l'indemnité de déplacement pour prise de deux repas principaux
 * @param categorie - Catégorie professionnelle (1-10)
 * @param echelon - Échelon dans la catégorie (1-5)
 * @returns Indemnité pour 2 repas (9 × salaire horaire minimum de la catégorie)
 */
export function calculerIndemniteDeplacementComplet(
  categorie: number,
  echelon: number
): number {
  const salaireHoraire = calculerTauxHoraire(getSalaireConvention(categorie, echelon))
  return Math.round(salaireHoraire * 9)
}

/**
 * Calcule l'indemnité de déplacement pour deux repas principaux + couchage
 * @param categorie - Catégorie professionnelle (1-10)
 * @param echelon - Échelon dans la catégorie (1-5)
 * @returns Indemnité pour 2 repas + couchage (12 × salaire horaire minimum de la catégorie)
 */
export function calculerIndemniteDeplacementCouchage(
  categorie: number,
  echelon: number
): number {
  const salaireHoraire = calculerTauxHoraire(getSalaireConvention(categorie, echelon))
  return Math.round(salaireHoraire * 12)
}