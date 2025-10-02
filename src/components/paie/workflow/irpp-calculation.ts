import { Employee } from './review-types'
import { calculateNombreParts } from './payroll-utils'

/**
 * Calcule l'IRPP selon le barème progressif du Congo
 */
export function calculateIRPP(salaireBrutMensuel: number, employee: Employee | undefined): number {
  const nombreParts = calculateNombreParts(employee)

  // Étape 1: Conversion en salaire annuel
  const salaireBrutAnnuel = salaireBrutMensuel * 12

  // Étape 2: Revenu brut imposable annuel (salaire brut + avantages en nature)
  const revenuBrutImposable = salaireBrutAnnuel

  // Étape 3: Déduction CNSS annuelle (4% plafonné à 14 400 000 par an)
  const plafondCNSSAnnuel = 1200000 * 12
  const deductionCNSS = Math.min(revenuBrutImposable, plafondCNSSAnnuel) * 0.04
  const revenuApresCNSS = revenuBrutImposable - deductionCNSS

  // Étape 4: Déduction forfaitaire frais professionnels (20%)
  const deductionFraisPro = revenuApresCNSS * 0.20
  const revenuNetImposable = revenuApresCNSS - deductionFraisPro

  // Étape 5: Division par le nombre de parts
  const revenuParPart = revenuNetImposable / nombreParts

  // Étape 6: Application du barème progressif annuel (par part)
  let irppParPart = 0

  if (revenuParPart <= 464000) {
    irppParPart = revenuParPart * 0.01
  } else if (revenuParPart <= 1000000) {
    irppParPart = 464000 * 0.01 + (revenuParPart - 464000) * 0.10
  } else if (revenuParPart <= 3000000) {
    irppParPart = 464000 * 0.01 + (1000000 - 464000) * 0.10 + (revenuParPart - 1000000) * 0.25
  } else {
    irppParPart = 464000 * 0.01 + (1000000 - 464000) * 0.10 + (3000000 - 1000000) * 0.25 + (revenuParPart - 3000000) * 0.40
  }

  // Étape 7: Multiplication par le nombre de parts
  const irppTotalAnnuel = irppParPart * nombreParts

  // Étape 8: Conversion mensuelle (IRPP annuel / 12)
  const irppMensuel = irppTotalAnnuel / 12

  return Math.max(0, irppMensuel)
}

/**
 * Calcule l'arrondi global et met à jour la variable globale
 */
let globalMontantArrondi = 0

export function calculateArrondi(netAvantArrondi: number, hasArrondiRubrique: boolean): number {
  if (!hasArrondiRubrique) {
    globalMontantArrondi = 0
    return 0
  }

  // Arrondir au millier le plus proche
  const netArrondi = Math.round(netAvantArrondi / 1000) * 1000
  const montantArrondi = netArrondi - netAvantArrondi
  globalMontantArrondi = montantArrondi

  console.log(`ARRONDI: ${netAvantArrondi} → ${netArrondi}, différence: ${montantArrondi}`)
  return montantArrondi
}

export function getGlobalMontantArrondi(): number {
  return globalMontantArrondi
}