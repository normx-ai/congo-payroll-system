/**
 * Interface pour les informations de congés
 */
export interface CongesInfo {
  acquis: number
  pris: number
  restants: number
}

/**
 * Récupère le nombre de congés pris depuis l'API
 */
export async function fetchCongesPris(employeeId: string, year: string): Promise<number> {
  try {
    const response = await fetch(`/api/payroll/conges?employeeId=${employeeId}&year=${year}`)
    if (response.ok) {
      const data = await response.json()
      return data.total || 0
    }
    return 0
  } catch (error) {
    console.error('Erreur récupération congés pris:', error)
    return 0
  }
}

/**
 * Calcule les congés selon les Articles 34 et 35
 */
export async function calculateConges(
  hireDate?: string,
  month?: string,
  year?: string,
  employeeId?: string
): Promise<CongesInfo> {
  // Article 34: Droit acquis après 12 mois de service
  // 26 jours de congés par an = 2.16667 jours par mois après 1 an

  if (!hireDate || !month || !year) {
    return { acquis: 0, pris: 0, restants: 0 }
  }

  const dateEmbauche = new Date(hireDate)
  const dateBulletin = new Date(parseInt(year), parseInt(month) - 1, 1)

  // Calculer le nombre de mois depuis l'embauche
  const moisDepuisEmbauche =
    (dateBulletin.getFullYear() - dateEmbauche.getFullYear()) * 12 +
    (dateBulletin.getMonth() - dateEmbauche.getMonth()) + 1

  if (moisDepuisEmbauche < 12) {
    // Pas encore 1 an de service - pas de congés selon Article 34
    return { acquis: 0, pris: 0, restants: 0 }
  }

  // Calcul des congés acquis pour l'année civile en cours
  // 2.16667 jours par mois travaillé dans l'année (26 jours / 12 mois)
  const moisDansAnnee = parseInt(month) // Janvier = 1, Février = 2, etc.
  const congesAcquis = moisDansAnnee * (26 / 12)

  // Article 35: Congés supplémentaires selon l'ancienneté
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

  // Récupérer les congés pris si on a un employeeId
  let congesPris = 0
  if (employeeId && year) {
    congesPris = await fetchCongesPris(employeeId, year)
  }

  return {
    acquis: totalCongesAcquis,
    pris: congesPris,
    restants: totalCongesAcquis - congesPris
  }
}