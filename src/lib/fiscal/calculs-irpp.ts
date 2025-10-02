// Calculs IRPP complets - CGI Congo Brazzaville

import { calculerPartsFiscales } from './quotient-familial'
import { calculerIRPPParPart, calculerDetailTranches, type TrancheIRPP } from './bareme-irpp'

/**
 * Interface pour le détail du calcul IRPP
 */
export interface CalculIRPPDetail {
  // Étape 1: Revenu brut imposable
  salaireBrutAnnuel: number
  avantagesNatureArgent: number
  revenuBrutImposable: number

  // Étape 2: Déductions CNSS
  cotisationCNSSSalarie: number
  revenuApresCNSS: number

  // Étape 3: Déduction forfaitaire frais professionnels (20%)
  deductionFraisProfessionnels: number
  revenuNetImposable: number

  // Étape 4: Quotient familial
  partsFiscales: number
  revenuNetImposableParPart: number

  // Étape 5: Calcul IRPP par part
  irppParPart: number
  detailTranches: Array<{
    tranche: TrancheIRPP
    baseImposable: number
    impot: number
  }>

  // Étape 6: IRPP total
  irppTotal: number

  // Informations complémentaires
  estExoneRevenufaible: boolean
  salaireMinimumGaranti: number
}

/**
 * Calcul complet de l'IRPP selon le CGI Congo
 * @param salaireBrutAnnuel - Salaire brut annuel
 * @param avantagesNatureArgent - Avantages en nature et en argent
 * @param situationFamiliale - Situation maritale
 * @param nbEnfantsCharge - Nombre d'enfants à charge
 * @returns Détail complet du calcul IRPP
 */
export function calculerIRPPComplet(
  salaireBrutAnnuel: number,
  avantagesNatureArgent: number = 0,
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number = 0
): CalculIRPPDetail {
  // Étape 1: Revenu brut imposable (Art. 39 CGI)
  const revenuBrutImposable = salaireBrutAnnuel + avantagesNatureArgent

  // Étape 2: Déductions CNSS (Art. 40 CGI)
  // CNSS salarié 4% sur assiette plafonnée à 1,200,000 FCFA/mois (14,400,000 FCFA/an)
  const assietteCNSSPlafonnee = Math.min(revenuBrutImposable, 14400000)
  const cotisationCNSSSalarie = Math.round(assietteCNSSPlafonnee * 0.04)
  const revenuApresCNSS = revenuBrutImposable - cotisationCNSSSalarie

  // Étape 3: Déduction forfaitaire 20% pour frais professionnels (Art. 41 CGI)
  const deductionFraisProfessionnels = Math.round(revenuApresCNSS * 0.20)
  const revenuNetImposable = revenuApresCNSS - deductionFraisProfessionnels

  // Étape 4: Quotient familial (Art. 91 CGI)
  const partsFiscales = calculerPartsFiscales(situationFamiliale, nbEnfantsCharge)
  const revenuNetImposableParPart = revenuNetImposable / partsFiscales

  // Étape 5: Calcul IRPP par part avec détail des tranches (Art. 95 CGI)
  const irppParPart = calculerIRPPParPart(revenuNetImposableParPart)
  const detailTranches = calculerDetailTranches(revenuNetImposableParPart)

  // Étape 6: IRPP total (Art. 89 CGI)
  const irppTotal = Math.round(irppParPart * partsFiscales)

  // Pas d'exonération revenus faibles (concept non applicable)
  const estExoneRevenufaible = false

  return {
    salaireBrutAnnuel,
    avantagesNatureArgent,
    revenuBrutImposable,
    cotisationCNSSSalarie,
    revenuApresCNSS,
    deductionFraisProfessionnels,
    revenuNetImposable,
    partsFiscales,
    revenuNetImposableParPart,
    irppParPart,
    detailTranches,
    irppTotal,
    estExoneRevenufaible,
    salaireMinimumGaranti: 0 // Concept non applicable
  }
}

/**
 * Calcule l'IRPP mensuel pour retenue à la source
 * @param salaireBrutMensuel - Salaire brut mensuel
 * @param avantagesNatureMensuel - Avantages mensuels
 * @param situationFamiliale - Situation maritale
 * @param nbEnfantsCharge - Nombre d'enfants à charge
 * @returns IRPP mensuel à retenir
 */
export function calculerIRPPMensuel(
  salaireBrutMensuel: number,
  avantagesNatureMensuel: number = 0,
  situationFamiliale: 'célibataire' | 'marié' | 'veuf' | 'divorcé',
  nbEnfantsCharge: number = 0
): number {
  // Extrapoler sur 12 mois
  const salaireBrutAnnuel = salaireBrutMensuel * 12
  const avantagesNatureAnnuel = avantagesNatureMensuel * 12

  // Calcul IRPP annuel
  const calculAnnuel = calculerIRPPComplet(
    salaireBrutAnnuel,
    avantagesNatureAnnuel,
    situationFamiliale,
    nbEnfantsCharge
  )

  // IRPP mensuel = IRPP annuel / 12
  return Math.round(calculAnnuel.irppTotal / 12)
}