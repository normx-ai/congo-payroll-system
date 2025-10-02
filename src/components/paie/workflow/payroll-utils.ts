import { Employee, PayrollParameter, RubriqueAmount } from './review-types'

/**
 * Récupère la valeur d'un paramètre avec validation
 */
export function getParameterValue(parameters: PayrollParameter[], parameter: string): number {
  const param = parameters.find(p => p.parameter === parameter)
  const value = param ? Number(param.value) : 0
  if (isNaN(value) || !isFinite(value)) {
    console.warn(`Invalid parameter value for ${parameter}:`, param?.value, 'converted to:', value)
    return 0
  }
  return value
}

/**
 * Récupère la valeur d'un montant de rubrique avec validation
 */
export function getAmountValue(amounts: RubriqueAmount[], rubriqueCode: string): number {
  const amount = amounts.find(a => a.rubriqueCode === rubriqueCode)
  const value = amount ? Number(amount.amount) : 0
  if (isNaN(value) || !isFinite(value)) {
    console.warn(`Invalid amount value for ${rubriqueCode}:`, amount?.amount, 'converted to:', value)
    return 0
  }
  return value
}

/**
 * Calcule l'ancienneté en texte formaté
 */
export function calculateAnciennete(employee: Employee | undefined, month: string, year: string): string {
  if (!employee?.hireDate) return ''

  const hireDate = new Date(employee.hireDate)
  const bulletinDate = new Date(parseInt(year), parseInt(month) - 1, new Date(parseInt(year), parseInt(month), 0).getDate())

  const years = bulletinDate.getFullYear() - hireDate.getFullYear()
  const months = bulletinDate.getMonth() - hireDate.getMonth()

  let totalMonths = years * 12 + months
  if (bulletinDate.getDate() < hireDate.getDate()) {
    totalMonths--
  }

  const anciennetYears = Math.floor(totalMonths / 12)
  const anciennetMonths = totalMonths % 12

  if (anciennetYears === 0) {
    return `${anciennetMonths} mois`
  } else if (anciennetMonths === 0) {
    return `${anciennetYears} an${anciennetYears > 1 ? 's' : ''}`
  } else {
    return `${anciennetYears} an${anciennetYears > 1 ? 's' : ''} ${anciennetMonths} mois`
  }
}

/**
 * Traduit le statut marital
 */
export function translateMaritalStatus(status: string): string {
  const translations: { [key: string]: string } = {
    'single': 'Célibataire',
    'married': 'Marié(e)',
    'divorced': 'Divorcé(e)',
    'widowed': 'Veuf/Veuve'
  }
  return translations[status] || status
}

/**
 * Calcule le nombre de parts fiscales
 */
export function calculateNombreParts(employee: Employee | undefined): number {
  const maritalStatus = employee?.maritalStatus || 'single'
  const childrenCount = employee?.childrenCount || 0

  // Règles selon l'Article 91 du CGI
  if (maritalStatus === 'single' || maritalStatus === 'divorced') {
    if (childrenCount === 0) return 1
    if (childrenCount === 1) return 2
    if (childrenCount === 2) return 2.5
    if (childrenCount === 3) return 3
    if (childrenCount === 4) return 3.5
    return Math.min(3.5 + (childrenCount - 4) * 0.5, 6.5)
  }

  if (maritalStatus === 'married' || maritalStatus === 'widowed') {
    if (childrenCount === 0) return 2
    if (childrenCount === 1) return 2.5
    if (childrenCount === 2) return 3
    if (childrenCount === 3) return 3.5
    return Math.min(3.5 + (childrenCount - 3) * 0.5, 6.5)
  }

  return 1
}

/**
 * Calcule le nombre d'années d'ancienneté
 */
export function calculateAnneesAnciennete(employee: Employee | undefined, month: string, year: string): number {
  if (!employee?.hireDate) return 0

  const hireDate = new Date(employee.hireDate)
  const bulletinDate = new Date(parseInt(year), parseInt(month) - 1, new Date(parseInt(year), parseInt(month), 0).getDate())

  const years = bulletinDate.getFullYear() - hireDate.getFullYear()
  const months = bulletinDate.getMonth() - hireDate.getMonth()

  let totalMonths = years * 12 + months
  if (bulletinDate.getDate() < hireDate.getDate()) {
    totalMonths--
  }

  return Math.floor(totalMonths / 12)
}

/**
 * Calcule le taux d'ancienneté formaté
 */
export function calculateTauxAnciennete(employee: Employee | undefined, month: string, year: string): string {
  const anneesAnciennete = calculateAnneesAnciennete(employee, month, year)

  if (anneesAnciennete < 2) return '0%'
  if (anneesAnciennete === 2) return '2%'
  if (anneesAnciennete >= 30) return '30%'

  const taux = Math.min(anneesAnciennete, 25)
  return `${taux}%`
}