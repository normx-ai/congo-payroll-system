// Calculs du quotient familial - Article 91 CGI Congo

/**
 * Table des parts fiscales selon l'Article 91 CGI
 */
export interface SituationFamiliale {
  parts: number
  situation: string
}

export const TABLE_PARTS_FISCALES: SituationFamiliale[] = [
  { parts: 1, situation: "Célibataire, divorcé ou veuf sans enfant à charge" },
  { parts: 2, situation: "Marié sans enfants à charge" },
  { parts: 2, situation: "Célibataire ou divorcé avec un enfant à charge" },
  { parts: 2.5, situation: "Marié ou veuf avec un enfant à charge" },
  { parts: 2.5, situation: "Célibataire ou divorcé avec deux enfants à charge" },
  { parts: 3, situation: "Célibataire ou divorcé avec trois enfants à charge" },
  { parts: 3, situation: "Marié ou veuf avec deux enfants à charge" },
  { parts: 3.5, situation: "Célibataire ou divorcé avec quatre enfants à charge" },
  { parts: 3.5, situation: "Marié ou veuf avec trois enfants à charge" }
]

/**
 * Calcule le nombre de parts fiscales selon la situation familiale
 * @param situationFamiliale - Statut marital (célibataire, marié, veuf, divorcé)
 * @param nbEnfantsCharge - Nombre d'enfants à charge
 * @returns Nombre de parts fiscales (maximum 6.5 parts)
 */
export function calculerPartsFiscales(
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number
): number {
  let parts = 1

  // Base selon la situation maritale
  if (situationFamiliale === 'marié') {
    parts = 2
  }

  // Ajout des parts pour enfants
  if (nbEnfantsCharge >= 1) {
    if (situationFamiliale === 'célibataire' || situationFamiliale === 'divorcé') {
      // Première enfant donne 1 part supplémentaire, puis 0.5 par enfant suivant
      parts = 2 + (nbEnfantsCharge - 1) * 0.5
    } else {
      // Marié ou veuf : 0.5 part par enfant
      parts = parts + nbEnfantsCharge * 0.5
    }
  }

  // Plafond à 6.5 parts maximum
  return Math.min(parts, 6.5)
}

/**
 * Fonction helper pour obtenir une description de la situation fiscale
 * @param situationFamiliale - Situation maritale
 * @param nbEnfantsCharge - Nombre d'enfants à charge
 * @returns Description textuelle de la situation
 */
export function getDescriptionSituationFiscale(
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number
): string {
  const baseDescription = situationFamiliale.charAt(0).toUpperCase() + situationFamiliale.slice(1)

  if (nbEnfantsCharge === 0) {
    return `${baseDescription} sans enfant à charge`
  } else if (nbEnfantsCharge === 1) {
    return `${baseDescription} avec un enfant à charge`
  } else {
    return `${baseDescription} avec ${nbEnfantsCharge} enfants à charge`
  }
}