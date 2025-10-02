/**
 * Calculs IRPP avec paramètres fiscaux dynamiques
 * Remplace les constantes hardcodées par des valeurs configurables
 */

import { FiscalParametersService, type IrppTrancheData } from './fiscal-parameters-service'
import { calculerPartsFiscales } from './quotient-familial'

export interface CalculIRPPDynamicDetail {
  // Étape 1: Revenu brut imposable
  salaireBrutAnnuel: number
  avantagesNatureArgent: number
  revenuBrutImposable: number

  // Étape 2: Déductions CNSS (paramètres dynamiques)
  tauxCNSS: number
  plafondCNSS: number
  cotisationCNSSSalarie: number
  revenuApresCNSS: number

  // Étape 3: Déduction frais professionnels (paramètre dynamique)
  tauxFraisPro: number
  deductionFraisProfessionnels: number
  revenuNetImposable: number

  // Étape 4: Quotient familial
  partsFiscales: number
  revenuNetImposableParPart: number

  // Étape 5: Calcul IRPP par part (tranches dynamiques)
  irppParPart: number
  detailTranches: Array<{
    tranche: IrppTrancheData
    baseImposable: number
    impot: number
  }>

  // Étape 6: IRPP total
  irppTotal: number
}

/**
 * Calcul IRPP complet avec paramètres fiscaux dynamiques
 */
export async function calculerIRPPDynamic(
  tenantId: string,
  salaireBrutAnnuel: number,
  avantagesNatureArgent: number = 0,
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number = 0
): Promise<CalculIRPPDynamicDetail> {

  // Récupération des paramètres fiscaux dynamiques
  const [tauxCNSS, plafondCNSS, tauxFraisPro, tranchesIRPP] = await Promise.all([
    FiscalParametersService.getCnssRate(tenantId),
    FiscalParametersService.getCnssAnnualCeiling(tenantId),
    FiscalParametersService.getProfessionalExpensesRate(tenantId),
    FiscalParametersService.getIrppTranches(tenantId)
  ])

  // Étape 1: Revenu brut imposable
  const revenuBrutImposable = salaireBrutAnnuel + avantagesNatureArgent

  // Étape 2: Déductions CNSS (paramètres dynamiques)
  const assietteCNSSPlafonnee = Math.min(revenuBrutImposable, plafondCNSS)
  const cotisationCNSSSalarie = Math.round(assietteCNSSPlafonnee * tauxCNSS)
  const revenuApresCNSS = revenuBrutImposable - cotisationCNSSSalarie

  // Étape 3: Déduction frais professionnels (paramètre dynamique)
  const deductionFraisProfessionnels = Math.round(revenuApresCNSS * tauxFraisPro)
  const revenuNetImposable = revenuApresCNSS - deductionFraisProfessionnels

  // Étape 4: Quotient familial
  const partsFiscales = calculerPartsFiscales(situationFamiliale, nbEnfantsCharge)
  const revenuNetImposableParPart = revenuNetImposable / partsFiscales

  // Étape 5: Calcul IRPP par part avec tranches dynamiques
  const { irppParPart, detailTranches } = calculerIRPPAvecTranchesPersonnalisees(
    revenuNetImposableParPart,
    tranchesIRPP
  )

  // Étape 6: IRPP total
  const irppTotal = Math.round(irppParPart * partsFiscales)

  return {
    salaireBrutAnnuel,
    avantagesNatureArgent,
    revenuBrutImposable,
    tauxCNSS,
    plafondCNSS,
    cotisationCNSSSalarie,
    revenuApresCNSS,
    tauxFraisPro,
    deductionFraisProfessionnels,
    revenuNetImposable,
    partsFiscales,
    revenuNetImposableParPart,
    irppParPart,
    detailTranches,
    irppTotal
  }
}

/**
 * Calcule l'IRPP avec des tranches personnalisées
 */
function calculerIRPPAvecTranchesPersonnalisees(
  revenuParPart: number,
  tranches: IrppTrancheData[]
): {
  irppParPart: number
  detailTranches: Array<{ tranche: IrppTrancheData; baseImposable: number; impot: number }>
} {
  if (revenuParPart <= 0) {
    return { irppParPart: 0, detailTranches: [] }
  }

  const detailTranches: Array<{ tranche: IrppTrancheData; baseImposable: number; impot: number }> = []
  let irppParPart = 0
  let baseRestante = revenuParPart

  for (const tranche of tranches) {
    if (baseRestante <= 0) break

    const seuil_max = tranche.seuil_max || Infinity
    const montantTranche = Math.min(
      baseRestante,
      seuil_max === Infinity ? baseRestante : Math.max(0, seuil_max - Math.max(tranche.seuil_min - 1, 0))
    )

    if (montantTranche > 0 && revenuParPart > tranche.seuil_min - 1) {
      const baseImposableTranche = Math.min(montantTranche, Math.max(0, revenuParPart - (tranche.seuil_min - 1)))
      const impotTranche = baseImposableTranche * (tranche.taux / 100)

      detailTranches.push({
        tranche,
        baseImposable: baseImposableTranche,
        impot: impotTranche
      })

      irppParPart += impotTranche
      baseRestante -= baseImposableTranche
    }
  }

  return {
    irppParPart: Math.round(irppParPart),
    detailTranches
  }
}

/**
 * Calcul IRPP mensuel avec paramètres dynamiques
 */
export async function calculerIRPPMensuelDynamic(
  tenantId: string,
  salaireBrutMensuel: number,
  avantagesNatureMensuel: number = 0,
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number = 0
): Promise<number> {
  // Extrapoler sur 12 mois
  const salaireBrutAnnuel = salaireBrutMensuel * 12
  const avantagesNatureAnnuel = avantagesNatureMensuel * 12

  // Calcul IRPP annuel avec paramètres dynamiques
  const calculAnnuel = await calculerIRPPDynamic(
    tenantId,
    salaireBrutAnnuel,
    avantagesNatureAnnuel,
    situationFamiliale,
    nbEnfantsCharge
  )

  // IRPP mensuel = IRPP annuel / 12
  return Math.round(calculAnnuel.irppTotal / 12)
}