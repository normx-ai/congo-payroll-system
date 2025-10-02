import { Employee, RubriqueAmount, PayrollParameter } from './review-types'
import { Rubrique } from './rubrique-types'
import { getParameterValue } from './payroll-utils'

/**
 * Filtre les rubriques à afficher selon les règles métier
 */
export function filterRubriquesToShow(
  rubriques: Rubrique[],
  selectedEmployeeData: Employee | undefined,
  amounts: RubriqueAmount[],
  parameters: PayrollParameter[] = []
): Rubrique[] {
  const mandatoryRubriques = ['0100', '1010', '3100', '3110', '3120', '3510', '3530', '3130', '3540', '3550', '5010', '9110']

  // Activer automatiquement la rubrique 0120 si jours travaillés < 26 ou joursAbsents > 0
  const joursTravailles = getParameterValue(parameters, 'joursTravailles') || 26
  const joursAbsents = getParameterValue(parameters, 'joursAbsents')
  const hasAbsences = joursAbsents !== undefined ? joursAbsents > 0 : joursTravailles < 26

  if (hasAbsences) {
    mandatoryRubriques.push('0120')
  }

  console.log('🔍 DEBUG Filter - Rubriques actives reçues:', rubriques.filter(r => r.isActive).map(r => ({ code: r.code, libelle: r.libelle, isActive: r.isActive })))

  const filtered = rubriques.filter(r => {
    // Rubriques obligatoires (y compris IRPP et CAMU)
    if (mandatoryRubriques.includes(r.code)) return true

    // Rubriques actives (cochées dans l'étape 2)
    if (r.isActive) return true

    // Charges fixes configurées (même si la rubrique n'est pas active)
    // On affiche toute rubrique qui a une charge fixe configurée et active
    const hasChargeFixe = selectedEmployeeData?.chargesFixes?.some(cf =>
      cf.rubriqueCode === r.code && cf.isActive
    )
    if (hasChargeFixe) return true

    // Montants saisis manuellement
    const hasAmount = amounts.some(a => a.rubriqueCode === r.code && a.amount > 0)
    return hasAmount
  })

  console.log('✅ DEBUG Filter - Rubriques filtrées:', filtered.map(r => ({ code: r.code, libelle: r.libelle, isActive: r.isActive })))

  const rubrique9110 = rubriques.find(r => r.code === '9110')
  console.log('🔎 DEBUG Filter - Rubrique 9110 avant filtrage:', rubrique9110 ? { code: rubrique9110.code, libelle: rubrique9110.libelle, isActive: rubrique9110.isActive } : 'NON TROUVÉE')

  const rubrique9110Apres = filtered.find(r => r.code === '9110')
  console.log('🔎 DEBUG Filter - Rubrique 9110 après filtrage:', rubrique9110Apres ? { code: rubrique9110Apres.code, libelle: rubrique9110Apres.libelle, isActive: rubrique9110Apres.isActive } : 'NON TROUVÉE (FILTRÉE)')

  return filtered
}