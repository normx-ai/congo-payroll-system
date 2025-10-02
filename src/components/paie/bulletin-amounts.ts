import { PayrollCalculation } from '@/lib/payroll'

/**
 * Calcule le salaire brut mensuel (tous les gains bruts)
 */
export function calculateSalaireBrutMensuel(calculation: PayrollCalculation): number {
  return calculation.rubriques.gains
    .filter(gain => gain.type === 'GAIN_BRUT')
    .reduce((sum, gain) => sum + gain.montant, 0)
}

/**
 * Calcule le net imposable mensuel
 */
export function calculateNetImposableMensuel(calculation: PayrollCalculation): number {
  const salaireBrut = calculateSalaireBrutMensuel(calculation)
  // Extraire la part salariale CNSS (4% du total 12%)
  const cnssTotal = calculation.rubriques.retenues
    .filter(ret => ret.code === '3100')
    .reduce((sum, ret) => sum + ret.montant, 0)
  const cnssSalariale = cnssTotal * (4/12) // 4% sur 12% total
  const revenuApresCNSS = salaireBrut - cnssSalariale
  return revenuApresCNSS * 0.80 // Moins 20% frais professionnels
}

/**
 * Calcule les charges salariales mensuelles
 */
export function calculateChargesSalarialesMensuelles(calculation: PayrollCalculation): number {
  // Part salariale CNSS + autres retenues salariales
  const cnssTotal = calculation.rubriques.retenues
    .filter(ret => ret.code === '3100')
    .reduce((sum, ret) => sum + ret.montant, 0)
  const cnssSalariale = cnssTotal * (4/12) // 4% sur 12% total

  const autresRetenues = calculation.rubriques.retenues
    .filter(ret => ['3510', '3540', '3550'].includes(ret.code))
    .reduce((sum, ret) => sum + ret.montant, 0)

  return cnssSalariale + autresRetenues
}

/**
 * Calcule les charges patronales mensuelles
 */
export function calculateChargesPatronalesMensuelles(calculation: PayrollCalculation): number {
  // Part patronale CNSS + autres charges patronales
  const cnssTotal = calculation.rubriques.retenues
    .filter(ret => ret.code === '3100')
    .reduce((sum, ret) => sum + ret.montant, 0)
  const cnssPatronale = cnssTotal * (8/12) // 8% sur 12% total

  const autresCharges = calculation.rubriques.retenues
    .filter(ret => ['3110', '3120', '3530', '3130', '3560', '3570'].includes(ret.code))
    .reduce((sum, ret) => sum + ret.montant, 0)

  return cnssPatronale + autresCharges
}

/**
 * Calcule l'IRPP mensuel
 */
export function calculateIRPPMensuel(calculation: PayrollCalculation): number {
  return calculation.rubriques.retenues
    .filter(ret => ret.code === '3510')
    .reduce((sum, ret) => sum + ret.montant, 0)
}

/**
 * Calcule le TOL mensuel
 */
export function calculateTOLMensuel(calculation: PayrollCalculation): number {
  return calculation.rubriques.retenues
    .filter(ret => ret.code === '3550')
    .reduce((sum, ret) => sum + ret.montant, 0)
}