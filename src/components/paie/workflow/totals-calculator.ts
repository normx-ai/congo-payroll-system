import { Employee, PayrollParameter, RubriqueAmount } from './review-types'
import { Rubrique } from './rubrique-types'
import { calculateRubriqueValue } from './payroll-calculations'
import { calculateArrondi } from './irpp-calculation'

/**
 * Interface pour les totaux calculés
 */
export interface PayrollTotals {
  totalGainsBruts: number
  totalGainsNonSoumis: number
  totalRetenues: number
  netAPayer: number
  totalGains: number
  montantArrondi: number
}

/**
 * Calcule tous les totaux de paie pour un employé
 */
export function calculatePayrollTotals(
  allRubriquesToShow: Rubrique[],
  selectedEmployeeData: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string
): PayrollTotals {
  // Calculer les gains bruts
  const totalGainsBruts = allRubriquesToShow
    .filter(r => r.type === 'GAIN_BRUT')
    .reduce((sum, r) => {
      const value = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow)
      return sum + value
    }, 0)

  // Calculer les gains non soumis
  const totalGainsNonSoumis = allRubriquesToShow
    .filter(r => r.type === 'GAIN_NON_SOUMIS')
    .reduce((sum, r) => {
      const value = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow)
      return sum + value
    }, 0)

  // Calculer les cotisations salariales uniquement (codes 3xxx)
  const totalCotisations = allRubriquesToShow
    .filter(r => r.type === 'COTISATION')
    .reduce((sum, r) => {
      const value = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow)

      // CNSS (3100) : part salariale = 4/12 du total
      if (r.code === '3100') {
        return sum + (value * (4/12))
      }

      // AT, PF, Retraite comp., Retraite base : charges 100% patronales, ne pas inclure
      if (['3110', '3120', '3530', '3130'].includes(r.code)) {
        return sum + 0
      }

      // Autres cotisations (IRPP 3510, CAMU 3540, etc.) : 100% salariales
      return sum + value
    }, 0)

  // Calculer les retenues non soumises (codes 6xxx uniquement)
  const totalRetenuesNonSoumises = allRubriquesToShow
    .filter(r => r.type === 'RETENUE_NON_SOUMISE')
    .reduce((sum, r) => {
      const value = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow)
      return sum + value
    }, 0)

  // Total retenues = cotisations + retenues non soumises
  const totalRetenues = totalCotisations + totalRetenuesNonSoumises

  // Calculer l'arrondi
  const netAvantArrondi = totalGainsBruts + totalGainsNonSoumis - totalRetenues

  console.log('📊 CALCUL NET À PAYER:')
  console.log('  - Total Brut:', totalGainsBruts)
  console.log('  - Gains non soumis:', totalGainsNonSoumis)
  console.log('  - Total Retenues:', totalRetenues)
  console.log('  - Net avant arrondi:', netAvantArrondi)

  const rubrique9110 = allRubriquesToShow.find(r => r.code === '9110')
  const montantArrondi = calculateArrondi(netAvantArrondi, !!rubrique9110)

  const totalGains = totalGainsBruts + totalGainsNonSoumis
  // Si arrondi positif : c'est un gain ajouté
  // Si arrondi négatif : c'est une retenue déduite
  // Donc: netAPayer = gains - retenues + arrondi
  const netAPayer = totalGainsBruts + totalGainsNonSoumis - totalRetenues + montantArrondi

  return {
    totalGainsBruts,
    totalGainsNonSoumis,
    totalRetenues,
    netAPayer,
    totalGains,
    montantArrondi
  }
}