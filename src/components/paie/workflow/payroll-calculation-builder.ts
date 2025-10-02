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

/**
 * Construit l'objet PayrollCalculation pour BulletinPreview
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
  }
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
      gains: buildGainsRubriques(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year),
      retenues: buildRetenuesRubriques(allRubriquesToShow, selectedEmployeeData, parameters, amounts, month, year, totalGainsBruts, totalGains),
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
  year: string
) {
  return allRubriquesToShow
    .filter(r => r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS')
    .map(r => ({
      code: r.code,
      designation: r.libelle,
      montant: calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow),
      quantite: getParameterValue(parameters, 'joursTravailles') || 26,
      taux: r.code === '1010' ? calculateTauxAnciennete(selectedEmployeeData, month, year) : (r.taux ? r.taux.toString() + '%' : ''),
      base: r.code === '1010' ? Number(selectedEmployeeData?.baseSalary || 0) : undefined,
      type: r.type
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
  totalGains: number
) {
  // Rubriques obligatoires qui doivent toujours apparaître même avec montant 0
  const mandatoryRetenues = ['3510', '3540', '9110'] // IRPP, CAMU et Arrondi

  return allRubriquesToShow
    .filter(r => r.type === 'RETENUE_NON_SOUMISE' || r.type === 'COTISATION' || r.type === 'ELEMENT_NON_IMPOSABLE')
    .map(r => {
      const montant = calculateRubriqueValue(r, selectedEmployeeData, parameters, amounts, month, year, allRubriquesToShow)

      // Debug pour IRPP et CAMU
      if (r.code === '3510' || r.code === '3540') {
        console.log(`Retenue ${r.code} (${r.libelle}): montant = ${montant}, totalGainsBruts = ${totalGainsBruts}`)
      }

      return {
        code: r.code,
        designation: r.libelle,
        montant: montant,
        base: calculateRetenueBase(r.code, totalGainsBruts, totalGains),
        taux: getRetenueTaux(r.code),
        chargePatronale: ['3100', '3110', '3120', '3530', '3130'].includes(r.code) ? (
          r.code === '3100' ? montant * (8/12) :
          montant
        ) : 0,
        type: r.type
      }
    })
    // Garder les rubriques obligatoires ou celles avec montant > 0
    .filter(ret => mandatoryRetenues.includes(ret.code) || ret.montant > 0)
    .sort((a, b) => a.code.localeCompare(b.code))
}

/**
 * Calcule la base pour une retenue
 */
function calculateRetenueBase(code: string, totalGainsBruts: number, totalGains: number): number | undefined {
  if (['3100', '3110', '3120', '3510', '3530', '3130', '3540'].includes(code)) {
    if (code === '3100') return Math.min(totalGainsBruts, 1200000)
    if (['3110', '3120'].includes(code)) return Math.min(totalGainsBruts, 600000)
    if (code === '3510') {
      // Pour l'IRPP : Net imposable = salaire brut - CNSS (4%) - frais professionnels (20%)
      const deductionCNSS = Math.min(totalGainsBruts, 1200000) * 0.04
      const salaireApresCNSS = totalGainsBruts - deductionCNSS
      const netImposable = salaireApresCNSS * 0.80 // Après déduction 20% frais pro
      return netImposable
    }
    if (code === '3540') {
      const cotisationsSociales = Math.min(totalGainsBruts, 1200000) * 0.04
      return Math.max(0, totalGainsBruts - cotisationsSociales - 500000)
    }
    return totalGainsBruts
  }
  if (['3550', '3560', '3570'].includes(code) || code.startsWith('6')) return undefined
  return totalGains
}

/**
 * Retourne le taux pour une retenue
 */
function getRetenueTaux(code: string): string {
  const taux: { [key: string]: string } = {
    '3100': '12%',
    '3110': '10,03%',
    '3120': '2,25%',
    '3510': '',
    '3530': '4,125%',
    '3130': '3,375%',
    '3540': '0,5%'
  }
  return taux[code] || ''
}