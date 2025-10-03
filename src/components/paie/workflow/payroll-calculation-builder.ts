import { PayrollCalculation } from '@/lib/payroll'
import { Employee, PayrollParameter, RubriqueAmount } from './review-types'
import { Rubrique } from './rubrique-types'
import { calculateRubriqueValue } from './payroll-calculations'
import {
  getParameterValue,
  translateMaritalStatus,
  calculateNombreParts,
  calculateAnciennete,
  calculateTauxAnciennete
} from './payroll-utils'
import type { ParametresFiscaux } from '@/hooks/useParametresFiscaux'

/**
 * Construit l'objet PayrollCalculation pour BulletinPreview
 * MODIFIÉ: Utilise les paramètres fiscaux depuis la DB
 */
export function buildPayrollCalculation(
  selectedEmployeeData: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string,
  allRubriquesToShow: Rubrique[],
  totals: {
    totalGainsBruts: number
    totalGainsNonSoumis: number
    totalRetenues: number
    netAPayer: number
  },
  parametresFiscaux?: ParametresFiscaux
): PayrollCalculation {
  const { totalGainsBruts, totalGainsNonSoumis, totalRetenues, netAPayer } = totals
  const totalGains = totalGainsBruts + totalGainsNonSoumis

  return {
    employeeId: selectedEmployeeData?.id || '',
    employeeName: `${selectedEmployeeData?.firstName} ${selectedEmployeeData?.lastName}`,
    firstName: selectedEmployeeData?.firstName || '',
    lastName: selectedEmployeeData?.lastName || '',
    employeeCode: selectedEmployeeData?.employeeCode || '',
    position: selectedEmployeeData?.position || '',
    totalGains,
    totalRetenues,
    salaireNet: netAPayer,
    cotisationsEmployeur: totalRetenues * 0.5,
    employeeData: {
      dateEmbauche: selectedEmployeeData?.hireDate ? new Date(selectedEmployeeData.hireDate).toLocaleDateString('fr-FR') : '',
      departement: selectedEmployeeData?.department?.name || '',
      service: selectedEmployeeData?.conventionCollective || '',
      qualification: selectedEmployeeData?.contractType || '',
      categorie: selectedEmployeeData?.categorieProfessionnelle?.toString() || '',
      situationFamiliale: translateMaritalStatus(selectedEmployeeData?.maritalStatus || 'single'),
      nombreEnfants: selectedEmployeeData?.childrenCount || 0,
      nombreParts: calculateNombreParts(selectedEmployeeData),
      indice: selectedEmployeeData?.echelon?.toString() || '',
      niveau: selectedEmployeeData?.salaryCategory || '',
      niu: selectedEmployeeData?.nui || '',
      numeroCNSS: selectedEmployeeData?.cnssNumber || '',
      anciennete: selectedEmployeeData?.seniority || calculateAnciennete(selectedEmployeeData, month, year)
    },
    rubriques: {
      gains: buildGainsRubriques(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year, parametresFiscaux),
      retenues: buildRetenuesRubriques(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year, totalGainsBruts, totalGains, parametresFiscaux),
      autresRetenues: []
    }
  }
}

/**
 * Construit les rubriques de gains
 */
function buildGainsRubriques(
  allRubriquesToShow: Rubrique[],
  selectedEmployeeData: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string,
  parametresFiscaux?: ParametresFiscaux
) {
  return allRubriquesToShow
    .filter(r => r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS')
    .map(r => ({
      code: r.code,
      designation: r.libelle,
      montant: calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow, parametresFiscaux),
      quantite: getParameterValue(parameters, 'joursTravailles') || 26,
      taux: r.code === '1010' ? calculateTauxAnciennete(selectedEmployeeData, month, year) : (r.taux ? r.taux.toString() + '%' : ''),
      base: r.code === '1010' ? Number(selectedEmployeeData?.baseSalary || 0) : undefined,
      type: r.type as 'GAIN_BRUT' | 'GAIN_NON_SOUMIS'
    }))
    // Retirer le filtre qui supprime les montants à 0
    // Les rubriques configurées doivent apparaître même avec un montant de 0
    .sort((a, b) => a.code === '200' ? 1 : b.code === '200' ? -1 : a.code.localeCompare(b.code))
}

/**
 * Construit les rubriques de retenues
 */
function buildRetenuesRubriques(
  allRubriquesToShow: Rubrique[],
  selectedEmployeeData: Employee | undefined,
  parameters: PayrollParameter[],
  amounts: RubriqueAmount[],
  month: string,
  year: string,
  totalGainsBruts: number,
  totalGains: number,
  parametresFiscaux?: ParametresFiscaux
) {
  // Rubriques obligatoires qui doivent toujours apparaître même avec montant 0
  const mandatoryRetenues = ['3510', '3540', '9110'] // IRPP, CAMU et Arrondi

  return allRubriquesToShow
    .filter(r => r.type === 'RETENUE_NON_SOUMISE' || r.type === 'COTISATION' || r.type === 'ELEMENT_NON_IMPOSABLE')
    .map(r => {
      const montant = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow, parametresFiscaux)

      // Debug pour IRPP et CAMU
      if (r.code === '3510' || r.code === '3540') {
        console.log(`Retenue ${r.code} (${r.libelle}): montant = ${montant}, totalGainsBruts = ${totalGainsBruts}`)
      }

      // Calcul de la charge patronale avec taux depuis DB
      const cnssTauxEmployeur = parametresFiscaux?.cnss.tauxEmployeur ?? 8
      const cnssTauxTotal = parametresFiscaux ? (parametresFiscaux.cnss.tauxEmploye + parametresFiscaux.cnss.tauxEmployeur) : 12

      return {
        code: r.code,
        designation: r.libelle,
        montant: montant,
        base: calculateRetenueBase(r.code, totalGainsBruts, totalGains, parametresFiscaux),
        taux: getRetenueTaux(r.code, parametresFiscaux),
        chargePatronale: ['3100', '3110', '3120', '3530', '3130'].includes(r.code) ? (
          r.code === '3100' ? montant * (cnssTauxEmployeur / cnssTauxTotal) :
          montant
        ) : 0,
        type: r.type as 'COTISATION' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
      }
    })
    // Garder les rubriques obligatoires ou celles avec montant > 0
    .filter(ret => mandatoryRetenues.includes(ret.code) || ret.montant > 0)
    .sort((a, b) => a.code.localeCompare(b.code))
}

/**
 * Calcule la base pour une retenue
 * MODIFIÉ: Utilise les paramètres fiscaux depuis la DB
 */
function calculateRetenueBase(code: string, totalGainsBruts: number, totalGains: number, parametresFiscaux?: ParametresFiscaux): number | undefined {
  const cnssPlafond = parametresFiscaux?.cnss.plafond ?? 1200000
  const afPlafond = parametresFiscaux?.allocationsFamiliales.plafond ?? 600000
  const atPlafond = parametresFiscaux?.accidentsTravail.plafond ?? 600000
  const cnssTauxEmploye = parametresFiscaux?.cnss.tauxEmploye ?? 4
  const camuSeuil = parametresFiscaux?.camu.seuil ?? 500000

  if (['3100', '3110', '3120', '3510', '3530', '3130', '3540'].includes(code)) {
    if (code === '3100') return Math.min(totalGainsBruts, cnssPlafond)
    if (code === '3110') return Math.min(totalGainsBruts, afPlafond)
    if (code === '3120') return Math.min(totalGainsBruts, atPlafond)
    if (code === '3510') {
      // Pour l'IRPP : Net imposable = salaire brut - CNSS (taux employé) - frais professionnels (20%)
      const deductionCNSS = Math.min(totalGainsBruts, cnssPlafond) * (cnssTauxEmploye / 100)
      const salaireApresCNSS = totalGainsBruts - deductionCNSS
      const netImposable = salaireApresCNSS * 0.80 // Après déduction 20% frais pro
      return netImposable
    }
    if (code === '3540') {
      const cotisationsSociales = Math.min(totalGainsBruts, cnssPlafond) * (cnssTauxEmploye / 100)
      return Math.max(0, totalGainsBruts - cotisationsSociales - camuSeuil)
    }
    return totalGainsBruts
  }
  if (['3550', '3560', '3570'].includes(code) || code.startsWith('6')) return undefined
  return totalGains
}

/**
 * Retourne le taux pour une retenue
 * MODIFIÉ: Utilise les paramètres fiscaux depuis la DB
 */
function getRetenueTaux(code: string, parametresFiscaux?: ParametresFiscaux): string {
  const cnssTauxTotal = parametresFiscaux ? (parametresFiscaux.cnss.tauxEmploye + parametresFiscaux.cnss.tauxEmployeur) : 12
  const afTaux = parametresFiscaux?.allocationsFamiliales.taux ?? 10.03
  const atTaux = parametresFiscaux?.accidentsTravail.taux ?? 2.25
  const tusTaux = parametresFiscaux?.tus.tauxAdminFiscale ?? 4.125
  const tusSSTaux = parametresFiscaux?.tus.tauxSecuSociale ?? 3.375
  const camuTaux = parametresFiscaux?.camu.taux ?? 0.5

  const taux: { [key: string]: string } = {
    '3100': `${cnssTauxTotal}%`,
    '3110': `${afTaux.toFixed(2)}%`,
    '3120': `${atTaux.toFixed(2)}%`,
    '3510': '',
    '3530': `${tusTaux.toFixed(3)}%`,
    '3130': `${tusSSTaux.toFixed(3)}%`,
    '3540': `${camuTaux.toFixed(1)}%`
  }
  return taux[code] || ''
}