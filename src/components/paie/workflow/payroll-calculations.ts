import { calculerPrimeAnciennete } from '@/lib/payroll/anciennete'
import { Employee, PayrollParameter, RubriqueAmount } from './review-types'
import { Rubrique } from './rubrique-types'
import { getParameterValue, getAmountValue, calculateAnneesAnciennete } from './payroll-utils'
import { calculateIRPP, getGlobalMontantArrondi } from './irpp-calculation'
import type { ParametresFiscaux } from '@/hooks/useParametresFiscaux'

/**
 * Calcule la valeur d'une rubrique selon son type et sa formule
 * MODIFIÉ: Utilise les paramètres fiscaux depuis la DB au lieu de valeurs hardcodées
 */
export function calculateRubriqueValue(
  rubrique: Rubrique,
  employee: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string,
  allRubriquesToShow: Rubrique[],
  parametresFiscaux?: ParametresFiscaux,
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
      .reduce((sum: number, gain: Rubrique) => sum + calculateRubriqueValue(gain, employee, parameters, amounts, month, year, allRubriquesToShow, parametresFiscaux, true), 0)
  }

  // ========== COTISATIONS - UTILISE LA BASE DE DONNÉES ==========
  const salaireBrutTotal = getSalaireBrutTotal()

  // Récupération des paramètres fiscaux (avec valeurs par défaut si non fournis)
  const cnssPlafond = parametresFiscaux?.cnss.plafond ?? 1200000
  const cnssTauxTotal = parametresFiscaux ? (parametresFiscaux.cnss.tauxEmploye + parametresFiscaux.cnss.tauxEmployeur) : 12
  const afPlafond = parametresFiscaux?.allocationsFamiliales.plafond ?? 600000
  const afTaux = parametresFiscaux?.allocationsFamiliales.taux ?? 10.03
  const atPlafond = parametresFiscaux?.accidentsTravail.plafond ?? 600000
  const atTaux = parametresFiscaux?.accidentsTravail.taux ?? 2.25
  const tusTaux = parametresFiscaux?.tus.tauxAdminFiscale ?? 4.125
  const tusSSTaux = parametresFiscaux?.tus.tauxSecuSociale ?? 3.375
  const camuTaux = parametresFiscaux?.camu.taux ?? 0.5
  const camuSeuil = parametresFiscaux?.camu.seuil ?? 500000
  const taxeLocal = parametresFiscaux?.taxesLocales.local ?? 1000
  const taxeExpat = parametresFiscaux?.taxesLocales.expat ?? 5000
  const taxeRegionale = parametresFiscaux?.taxesLocales.regionale ?? 2400

  // CNSS - Retenue totale (4% salariale + 8% patronale = 12% plafonné)
  // Formule DB: MIN(salaireBrut, plafond) * (tauxEmploye + tauxEmployeur) / 100
  if (rubrique.code === '3100') {
    return Math.min(salaireBrutTotal, cnssPlafond) * (cnssTauxTotal / 100)
  }

  // SS - Allocations familiales (plafonné)
  // Formule DB: MIN(salaireBrut, plafond) * taux / 100
  if (rubrique.code === '3110') {
    return Math.min(salaireBrutTotal, afPlafond) * (afTaux / 100)
  }

  // SS - Accident de travail (plafonné)
  // Formule DB: MIN(salaireBrut, plafond) * taux / 100
  if (rubrique.code === '3120') {
    return Math.min(salaireBrutTotal, atPlafond) * (atTaux / 100)
  }

  // Retenue IRPP du mois
  // Formule DB: calculerIRPPMensuel(salaireBrut, avantagesNature, situationFamiliale, nbEnfants)
  if (rubrique.code === '3510') return calculateIRPP(salaireBrutTotal, employee)

  // Régularisation IRPP (formule à définir plus tard)
  if (rubrique.code === '3520') return 0 // TODO: définir formule

  // ⚠️ ATTENTION: Ces deux taxes sont PATRONALES (pas retenues sur salaire)
  // Mais elles apparaissent dans le bulletin pour information

  // Taxe unique sur salaire → Administration Fiscale - PATRONALE
  // Formule DB: salaireBrut * taux / 100
  if (rubrique.code === '3530') {
    return salaireBrutTotal * (tusTaux / 100)
  }

  // SS - Taxe unique sur salaire → Sécurité Sociale - PATRONALE
  // Formule DB: salaireBrut * taux / 100
  if (rubrique.code === '3130') {
    return salaireBrutTotal * (tusSSTaux / 100)
  }

  // Retenue CAMU (sur excédent)
  // Formule DB: MAX(0, (salaireBrut - cotisationsSociales - seuil) * taux / 100)
  if (rubrique.code === '3540') {
    const cnssTauxEmploye = parametresFiscaux?.cnss.tauxEmploye ?? 4
    const cotisationsSociales = Math.min(salaireBrutTotal, cnssPlafond) * (cnssTauxEmploye / 100)
    return Math.max(0, (salaireBrutTotal - cotisationsSociales - camuSeuil) * (camuTaux / 100))
  }

  // Taxes sur les locaux (montants fixes depuis DB)
  if (rubrique.code === '3550') return taxeLocal
  if (rubrique.code === '3560') return taxeExpat
  if (rubrique.code === '3570') return taxeRegionale

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

