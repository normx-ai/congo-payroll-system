import { calculerPrimeAnciennete } from '@/lib/payroll/anciennete'
import { Employee, PayrollParameter, RubriqueAmount } from './review-types'
import { Rubrique } from './rubrique-types'
import { getParameterValue, getAmountValue, calculateAnneesAnciennete } from './payroll-utils'
import { calculateIRPP, getGlobalMontantArrondi } from './irpp-calculation'

/**
 * Calcule la valeur d'une rubrique selon son type et sa formule
 */
export function calculateRubriqueValue(
  rubrique: Rubrique,
  employee: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string,
  allRubriquesToShow: Rubrique[],
  skipBrutCalculation = false
): number {
  // Calcul du salaire de base
  if (rubrique.code === '0100') {
    const joursTravailles = getParameterValue(parameters, 'joursTravailles') || 26
    const salaireBase = Number(employee?.baseSalary || 0)
    const result = salaireBase * (joursTravailles / 26)
    console.log(`Salaire de base (001): salaireBase=${salaireBase}, joursTravailles=${joursTravailles}, result=${result}`)
    return result
  }

  // Sursalaire
  if (rubrique.code === '0110') {
    const manualAmount = getAmountValue(amounts, rubrique.code)
    if (manualAmount > 0) return manualAmount

    const montantSursalaire = getParameterValue(parameters, 'montantSursalaire')
    const joursTravailles = getParameterValue(parameters, 'joursTravailles') || 26
    if (montantSursalaire && joursTravailles) {
      return montantSursalaire * (joursTravailles / 26)
    }
    return 0
  }

  // Jours absents (retenue imposable en négatif)
  if (rubrique.code === '0120') {
    const joursTravailles = getParameterValue(parameters, 'joursTravailles') || 26
    let joursAbsents = getParameterValue(parameters, 'joursAbsents')

    // Approche hybride : calcul automatique par défaut, saisie manuelle possible
    if (joursAbsents === undefined || joursAbsents === null) {
      // Calcul automatique : 26 - jours travaillés
      joursAbsents = 26 - joursTravailles
    }

    // Si pas d'absence, retourner 0
    if (joursAbsents === 0 || joursAbsents < 0) return 0

    const salaireBase = Number(employee?.baseSalary || 0)
    const montantSursalaire = getParameterValue(parameters, 'montantSursalaire') || 0

    // Calcul: -((salaire base + sursalaire) / 26) × jours absents (NEGATIF)
    const montantJournalier = (salaireBase + montantSursalaire) / 26
    const retenueAbsence = -(montantJournalier * joursAbsents)

    console.log(`Jours absents (0120): joursTravailles=${joursTravailles}, joursAbsents=${joursAbsents}, salaireBase=${salaireBase}, sursalaire=${montantSursalaire}, retenue=${retenueAbsence}`)
    return retenueAbsence
  }

  // Prime d'ancienneté
  if (rubrique.code === '1010') {
    const salaireBase = Number(employee?.baseSalary || 0)
    const anneesAnciennete = calculateAnneesAnciennete(employee, month, year)
    const prime = calculerPrimeAnciennete(salaireBase, anneesAnciennete)
    console.log(`Prime d'ancienneté (1010): salaireBase=${salaireBase}, anneesAnciennete=${anneesAnciennete}, prime=${prime}`)
    return prime
  }

  // Éviter la récursion pour le calcul du brut
  if (skipBrutCalculation) {
    if (rubrique.type === 'GAIN_BRUT' && rubrique.code !== '0100') {
      const chargeFixe = employee?.chargesFixes?.find(cf =>
        cf.rubriqueCode === rubrique.code && cf.isActive
      )
      if (chargeFixe && chargeFixe.amount > 0) {
        return Number(chargeFixe.amount)
      }

      const manualAmount = getAmountValue(amounts, rubrique.code)
      if (manualAmount > 0) return manualAmount
    }
    return 0
  }

  const getSalaireBrutTotal = () => {
    return allRubriquesToShow
      .filter((gain: Rubrique) => gain.type === 'GAIN_BRUT')
      .reduce((sum: number, gain: Rubrique) => sum + calculateRubriqueValue(gain, employee, parameters, amounts, month, year, allRubriquesToShow, true), 0)
  }

  // Cotisations - UTILISE LES FORMULES CORRECTES (alignées avec la DB)
  const salaireBrutTotal = getSalaireBrutTotal()

  // CNSS - Retenue totale (4% salariale + 8% patronale = 12% plafonné à 1 200 000)
  // Formule DB: MIN(salaireBrut, 1200000) * 0.12
  if (rubrique.code === '3100') return Math.min(salaireBrutTotal, 1200000) * 0.12

  // SS - Allocations familiales (10.03% plafonné à 600 000)
  // Formule DB: MIN(salaireBrut, 600000) * 0.1003
  if (rubrique.code === '3110') return Math.min(salaireBrutTotal, 600000) * 0.1003

  // SS - Accident de travail (2.25% plafonné à 600 000)
  // Formule DB: MIN(salaireBrut, 600000) * 0.0225
  if (rubrique.code === '3120') return Math.min(salaireBrutTotal, 600000) * 0.0225

  // Retenue IRPP du mois
  // Formule DB: calculerIRPPMensuel(salaireBrut, avantagesNature, situationFamiliale, nbEnfants)
  if (rubrique.code === '3510') return calculateIRPP(salaireBrutTotal, employee)

  // Régularisation IRPP (formule à définir plus tard)
  if (rubrique.code === '3520') return 0 // TODO: définir formule

  // ⚠️ ATTENTION: Ces deux taxes sont PATRONALES (pas retenues sur salaire)
  // Mais elles apparaissent dans le bulletin pour information

  // Taxe unique sur salaire → Administration Fiscale (4.125%) - PATRONALE
  // Formule DB: salaireBrut * 0.04125
  if (rubrique.code === '3530') return salaireBrutTotal * 0.04125

  // SS - Taxe unique sur salaire → Sécurité Sociale (3.375%) - PATRONALE
  // Formule DB: salaireBrut * 0.03375
  if (rubrique.code === '3130') return salaireBrutTotal * 0.03375

  // Retenue CAMU (0.5% sur excédent > 500 000)
  // Formule DB: MAX(0, (salaireBrut - cotisationsSociales - 500000) * 0.005)
  if (rubrique.code === '3540') {
    const cotisationsSociales = Math.min(salaireBrutTotal, 1200000) * 0.04
    return Math.max(0, (salaireBrutTotal - cotisationsSociales - 500000) * 0.005)
  }

  // Taxes sur les locaux
  if (rubrique.code === '3550') return 1000 // Taxe locaux (local)
  if (rubrique.code === '3560') return 5000 // Taxe locaux (Expat)
  if (rubrique.code === '3570') return 2400 // Taxe régionale

  // Arrondis net à payer
  if (rubrique.code === '9110') return getGlobalMontantArrondi()

  // Charges fixes ou montants manuels
  const chargeFixe = employee?.chargesFixes?.find(cf =>
    cf.rubriqueCode === rubrique.code && cf.isActive
  )

  // Debug log pour vérifier les données
  if (rubrique.code !== '0100' && rubrique.code !== '1010') {
    console.log(`Rubrique ${rubrique.code} (${rubrique.libelle}):`, {
      hasChargeFixe: !!chargeFixe,
      chargeFixeAmount: chargeFixe?.amount,
      isActive: chargeFixe?.isActive,
      allChargesFixes: employee?.chargesFixes?.map(cf => ({ code: cf.rubriqueCode, amount: cf.amount, active: cf.isActive }))
    })
  }

  if (chargeFixe && chargeFixe.amount > 0) {
    console.log(`Retour charge fixe pour ${rubrique.code}: ${chargeFixe.amount}`)
    return Number(chargeFixe.amount)
  }

  const manualAmount = getAmountValue(amounts, rubrique.code)
  if (manualAmount > 0) {
    console.log(`Retour montant manuel pour ${rubrique.code}: ${manualAmount}`)
    return manualAmount
  }

  return 0
}

