// Formules de calcul pour les rubriques de paie Convention Commerce
import { calculerPrimeAnciennete } from './payroll/anciennete'

export interface EmployeePeriod {
  salaireBase: number
  ancienneteAnnees: number
  ancienneteMois: number
  joursTravailles: number
  heuresSupplementaires?: {
    jour15h: number
    jourPlus5h: number
    nuitRepos: number
    nuitFeries: number
  }
}

// Calcul Prime d'Ancienneté (Article 41)
export function calculatePrimeAnciennete(salaireBase: number, ancienneteAnnees: number): number {
  return calculerPrimeAnciennete(salaireBase, ancienneteAnnees)
}

// Calcul Prime de Fin d'Année (Article 45)
export function calculatePrimeFinAnnee(
  salaireBase: number,
  ancienneteMois: number,
  dateEmbauche: Date,
  dateCalcul: Date,
  statut: 'actif' | 'demissionnaire' | 'licencie'
): number {
  // Ancienneté minimale 1 an
  if (ancienneteMois < 12) return 0

  const anneeEmbauche = dateEmbauche.getFullYear()
  const anneeCalcul = dateCalcul.getFullYear()

  // Si embauché au cours du 1er trimestre = prorata temporis
  if (anneeEmbauche === anneeCalcul && dateEmbauche.getMonth() < 3) {
    const moisProrata = 12 - dateEmbauche.getMonth()
    return (salaireBase * moisProrata) / 12
  }

  // Démissionnaire/licencié = prorata temporis
  if (statut !== 'actif') {
    const moisTravailles = dateCalcul.getMonth() + 1
    return (salaireBase * moisTravailles) / 12
  }

  return salaireBase // Prime complète
}

// Calcul Heures Supplémentaires (Article 32)
export function calculateHeuresSupplementaires(
  salaireHoraire: number,
  heures: {
    jour15h: number
    jourPlus5h: number
    nuitRepos: number
    nuitFeries: number
  }
): {
  hsJour15h: number
  hsJourPlus5h: number
  hsNuitRepos: number
  hsNuitFeries: number
  total: number
} {
  const hsJour15h = salaireHoraire * heures.jour15h * 1.10      // +10%
  const hsJourPlus5h = salaireHoraire * heures.jourPlus5h * 1.25 // +25%
  const hsNuitRepos = salaireHoraire * heures.nuitRepos * 1.50     // +50%
  const hsNuitFeries = salaireHoraire * heures.nuitFeries * 2.00   // +100%

  return {
    hsJour15h,
    hsJourPlus5h,
    hsNuitRepos,
    hsNuitFeries,
    total: hsJour15h + hsJourPlus5h + hsNuitRepos + hsNuitFeries
  }
}

// Calcul Indemnité de Déplacement (Article 45)
export function calculateIndemniteDeplacment(
  salaireHoraireMinimumCategorie: number,
  typeDeplacement: 'unRepas' | 'deuxRepas' | 'deuxRepasCouchage'
): number {
  const baremes = {
    'unRepas': 5,
    'deuxRepas': 9,
    'deuxRepasCouchage': 12
  }

  return salaireHoraireMinimumCategorie * baremes[typeDeplacement]
}

// Calcul Congés Payés - Allocation (Article 36)
export function calculateAllocationConge(
  salaireMoyen12Mois: number,
  joursConge: number
): number {
  // Calcul selon Article 122 du Code du travail
  // Base = salaire moyen des 12 mois précédents
  return (salaireMoyen12Mois * joursConge) / 30
}

// Calcul Congés Supplémentaires selon ancienneté (Article 35)
export function calculateCongesSupplementaires(ancienneteAnnees: number): number {
  if (ancienneteAnnees < 3) return 0
  if (ancienneteAnnees < 5) return 3
  if (ancienneteAnnees < 10) return 5
  if (ancienneteAnnees < 15) return 6
  if (ancienneteAnnees < 20) return 8
  if (ancienneteAnnees < 25) return 9
  if (ancienneteAnnees < 30) return 10
  return 15 // 30 ans et plus
}

// Calcul Indemnité de Licenciement (Article 21)
export function calculateIndemneLicenciement(
  salaireMoyen12Mois: number,
  ancienneteAnnees: number,
  ancienneteMois: number
): number {
  // Ancienneté minimale 18 mois
  if (ancienneteMois < 18) return 0

  let taux = 0

  if (ancienneteAnnees >= 21) {
    taux = 50
  } else if (ancienneteAnnees >= 13) {
    taux = 44
  } else if (ancienneteAnnees >= 7) {
    taux = 38
  } else if (ancienneteAnnees >= 1) {
    taux = 30
  }

  // Prendre en compte les fractions d'années d'au moins 1 mois
  const moisSupplementaires = ancienneteMois % 12
  let majorationMois = 0

  if (moisSupplementaires >= 1) {
    majorationMois = (taux / 12) * moisSupplementaires
  }

  const indemniteBase = (salaireMoyen12Mois * taux) / 100
  const majoration = (salaireMoyen12Mois * majorationMois) / 100

  return indemniteBase + majoration
}

// Calcul Indemnité de Départ à la Retraite (Article 23)
export function calculateIndemniteRetraite(
  salaireMensuel: number,
  ancienneteAnnees: number
): number {
  if (ancienneteAnnees < 10) {
    return salaireMensuel * 5 // 5 mois
  } else {
    return salaireMensuel * 7 // 7 mois
  }
}

// Utilitaire: Calcul salaire horaire depuis salaire mensuel
export function calculateSalaireHoraire(salaireMensuel: number): number {
  // Base légale: 40h/semaine = 173.33h/mois
  return salaireMensuel / 173.33
}