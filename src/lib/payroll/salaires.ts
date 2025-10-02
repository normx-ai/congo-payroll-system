// Grille salariale et calculs salaires - Convention Collective Commerce Congo Brazzaville

export interface GrilleSalariale {
  [categorie: number]: {
    [echelon: number]: number
  }
}

// Grille salariale officielle Convention Collective Commerce - Mise à jour 2024
export const GRILLE_SALARIALE_COMMERCE: GrilleSalariale = {
  1: { 1: 63393, 2: 64410, 3: 65427, 4: 66444, 5: 67461 },
  2: { 1: 68478, 2: 69676, 3: 70874, 4: 72071, 5: 73269 },
  3: { 1: 74467, 2: 75665, 3: 76863, 4: 78060, 5: 79258 },
  4: { 1: 80456, 2: 84343, 3: 88230, 4: 92118, 5: 96005 },
  5: { 1: 99008, 2: 102189, 3: 105370, 4: 108550, 5: 111194 },
  6: { 1: 114912, 2: 118362, 3: 121811, 4: 125261, 5: 128710 },
  7: { 1: 132160, 2: 139328, 3: 146496, 4: 153664, 5: 160832 },
  8: { 1: 165000, 2: 166320, 3: 167640, 4: 168920, 5: 170280 },
  9: { 1: 171600, 2: 185000 },
  10: { 1: 212300, 2: 222915 }
}

/**
 * Récupère le salaire selon la convention collective Commerce Congo
 */
export function getSalaireConvention(
  categorie: number,
  echelon: number,
  conventionCollective: string = 'Commerce'
): number {
  if (conventionCollective !== 'Commerce') {
    throw new Error(`Convention collective "${conventionCollective}" non supportée`)
  }

  if (!GRILLE_SALARIALE_COMMERCE[categorie]) {
    throw new Error(`Catégorie ${categorie} n'existe pas dans la convention Commerce`)
  }

  if (!GRILLE_SALARIALE_COMMERCE[categorie][echelon]) {
    throw new Error(`Échelon ${echelon} n'existe pas pour la catégorie ${categorie}`)
  }

  return GRILLE_SALARIALE_COMMERCE[categorie][echelon]
}

/**
 * Calcule le salaire de base selon les jours travaillés
 */
export function calculerSalaireBase(
  categorie: number,
  echelon: number,
  joursTravailles: number,
  joursOuvrablesMois: number = 26
): number {
  const salaireComplet = getSalaireConvention(categorie, echelon)
  return Math.round(salaireComplet * (joursTravailles / joursOuvrablesMois))
}

/**
 * Calcule le taux horaire à partir du salaire mensuel
 */
export function calculerTauxHoraire(salaireMensuel: number): number {
  // 173.33 heures = 40h/semaine * 52 semaines / 12 mois
  return salaireMensuel / 173.33
}

/**
 * Description des catégories professionnelles
 */
function getCategorieDescription(categorie: number): string {
  const descriptions: { [key: number]: string } = {
    1: 'Ouvriers, employés débutants',
    2: 'Ouvriers, employés débutants',
    3: 'Employés expérimentés',
    4: 'Employés expérimentés',
    5: 'Agents de maîtrise',
    6: 'Agents de maîtrise',
    7: 'Cadres',
    8: 'Cadres',
    9: 'Cadres supérieurs',
    10: 'Cadres supérieurs'
  }
  return descriptions[categorie] || 'Non défini'
}

/**
 * Obtient toutes les catégories disponibles pour une convention
 */
export function getCategoriesDisponibles(conventionCollective: string = 'Commerce') {
  if (conventionCollective !== 'Commerce') {
    return {}
  }

  return Object.keys(GRILLE_SALARIALE_COMMERCE).map(cat => {
    const categorie = parseInt(cat)
    const echelons = Object.keys(GRILLE_SALARIALE_COMMERCE[categorie]).map(ech => parseInt(ech))
    return {
      categorie,
      echelons,
      description: getCategorieDescription(categorie)
    }
  })
}