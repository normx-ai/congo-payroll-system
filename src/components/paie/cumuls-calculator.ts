import { PayrollCalculation } from '@/lib/payroll'

/**
 * Interface pour les cumuls annuels
 */
export interface CumulAnnuel {
  salaireBrut: number
  netImposable: number
  chargesSalariales: number
  chargesPatronales: number
  basConges: number
  irpp: number
  tol: number
}

/**
 * Calcule les cumuls à partir du bulletin actuel
 */
export function calculateCurrentCumuls(calculation: PayrollCalculation): CumulAnnuel {
  const salaireBrut = calculation.rubriques.gains
    .filter(gain => gain.type === 'GAIN_BRUT')
    .reduce((sum, gain) => sum + gain.montant, 0)

  // Extraire la part salariale CNSS (4% du total 12%)
  const cnssTotal = calculation.rubriques.retenues
    .filter(ret => ret.code === '3100')
    .reduce((sum, ret) => sum + ret.montant, 0)
  const cnssSalariale = cnssTotal * (4/12) // 4% sur 12% total

  const revenuApresCNSS = salaireBrut - cnssSalariale

  return {
    salaireBrut,
    netImposable: revenuApresCNSS * 0.80,
    chargesSalariales: (() => {
      const cnssTotal = calculation.rubriques.retenues
        .filter(ret => ret.code === '3100')
        .reduce((sum, ret) => sum + ret.montant, 0)
      const cnssSalariale = cnssTotal * (4/12)
      const autresRetenues = calculation.rubriques.retenues
        .filter(ret => ['3510', '3540', '3550'].includes(ret.code))
        .reduce((sum, ret) => sum + ret.montant, 0)
      return cnssSalariale + autresRetenues
    })(),
    chargesPatronales: (() => {
      const cnssTotal = calculation.rubriques.retenues
        .filter(ret => ret.code === '3100')
        .reduce((sum, ret) => sum + ret.montant, 0)
      const cnssPatronale = cnssTotal * (8/12)
      const autresCharges = calculation.rubriques.retenues
        .filter(ret => ['3110', '3120', '3530', '3130', '3560', '3570'].includes(ret.code))
        .reduce((sum, ret) => sum + ret.montant, 0)
      return cnssPatronale + autresCharges
    })(),
    basConges: salaireBrut,
    irpp: calculation.rubriques.retenues
      .filter(ret => ret.code === '3510')
      .reduce((sum, ret) => sum + ret.montant, 0),
    tol: calculation.rubriques.retenues
      .filter(ret => ret.code === '3550')
      .reduce((sum, ret) => sum + ret.montant, 0)
  }
}

/**
 * Récupère les cumuls annuels depuis l'API
 */
export async function fetchCumulAnnuel(
  employeeId: string,
  year: string,
  month: string,
  calculation: PayrollCalculation
): Promise<CumulAnnuel> {
  try {
    const response = await fetch(`/api/payroll/cumuls?employeeId=${employeeId}&year=${year}&currentMonth=${month}`)
    if (response.ok) {
      const data = await response.json()
      if (data.cumuls) {
        return data.cumuls
      }
    }
    console.error('Erreur récupération cumuls:', response.statusText)
  } catch (error) {
    console.error('Erreur fetch cumuls:', error)
  }

  // Fallback : utiliser les montants du bulletin actuel
  return calculateCurrentCumuls(calculation)
}