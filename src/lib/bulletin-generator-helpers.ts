import { CongesInfo } from '@/components/paie/conges-calculator'

/**
 * Version synchrone du calcul des congés pour la génération PDF
 * (pas d'appel API, calcul direct)
 */
export function calculateCongesSync(
  hireDate?: string,
  month?: string,
  year?: string
): CongesInfo {
  if (!hireDate || !month || !year) {
    return { acquis: 0, pris: 0, restants: 0 }
  }

  const dateEmbauche = new Date(hireDate)
  const dateBulletin = new Date(parseInt(year), parseInt(month) - 1, 1)

  const moisDepuisEmbauche =
    (dateBulletin.getFullYear() - dateEmbauche.getFullYear()) * 12 +
    (dateBulletin.getMonth() - dateEmbauche.getMonth()) + 1

  if (moisDepuisEmbauche < 12) {
    return { acquis: 0, pris: 0, restants: 0 }
  }

  const moisDansAnnee = parseInt(month)
  const congesAcquis = moisDansAnnee * (26 / 12)

  const anneesAnciennete = Math.floor(moisDepuisEmbauche / 12)
  let congesSupplementaires = 0

  if (anneesAnciennete >= 30) congesSupplementaires = 15
  else if (anneesAnciennete >= 25) congesSupplementaires = 10
  else if (anneesAnciennete >= 20) congesSupplementaires = 9
  else if (anneesAnciennete >= 15) congesSupplementaires = 8
  else if (anneesAnciennete >= 10) congesSupplementaires = 6
  else if (anneesAnciennete >= 5) congesSupplementaires = 5
  else if (anneesAnciennete >= 3) congesSupplementaires = 3

  const totalCongesAcquis = congesAcquis + congesSupplementaires

  return {
    acquis: totalCongesAcquis,
    pris: 0, // Pas de fetch API pour PDF
    restants: totalCongesAcquis
  }
}
