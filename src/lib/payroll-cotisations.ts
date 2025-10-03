// Calculs des cotisations et retenues Congo
import { ParametresFiscauxService } from '@/lib/services/parametres-fiscaux.service'
import { BaremeIrppService } from '@/lib/services/bareme-irpp.service'

export interface BrutCalculation {
  brutSocial: number    // Base pour CNSS, CAMU
  brutFiscal: number    // Base pour IRPP, TUS, Taxe départementale
  salaireBase: number   // Salaire contractuel
}

export interface CotisationResult {
  employe: number
  employeur: number
  total: number
}

// Calcul CNSS (Caisse Nationale de Sécurité Sociale) - Version DB
export async function calculateCNSS(
  tenantId: string,
  brutSocial: number,
  periode: Date = new Date()
): Promise<CotisationResult> {
  console.log('[DEBUG calculateCNSS] START')
  console.log('  - tenantId:', tenantId, 'type:', typeof tenantId)
  console.log('  - brutSocial:', brutSocial)
  console.log('  - periode:', periode.toISOString())

  const params = await ParametresFiscauxService.getParametres(
    tenantId,
    ['CNSS_EMPLOYE', 'CNSS_EMPLOYEUR', 'CNSS_PLAFOND'],
    periode
  )

  console.log('[DEBUG calculateCNSS] Paramètres récupérés:', params)

  const baseImposable = Math.min(brutSocial, params.CNSS_PLAFOND)
  const employe = baseImposable * (params.CNSS_EMPLOYE / 100)
  const employeur = baseImposable * (params.CNSS_EMPLOYEUR / 100)

  return {
    employe: Math.round(employe),
    employeur: Math.round(employeur),
    total: Math.round(employe + employeur)
  }
}

// Calcul CAMU (Contribution solidarité CAMU - Loi de finance 2022) - Version DB
// FORMULE CORRECTE: MAX(0, (salaireBrut - cotisationsCNSS - 500000) * 0.005)
// CAMU = COTISATION SALARIALE (employé uniquement)
export async function calculateCAMU(
  tenantId: string,
  brutSocial: number,
  periode: Date = new Date()
): Promise<CotisationResult> {
  const params = await ParametresFiscauxService.getParametres(
    tenantId,
    ['CAMU_CONTRIBUTION', 'CAMU_SEUIL', 'CNSS_EMPLOYE', 'CNSS_PLAFOND'],
    periode
  )

  const taux = params.CAMU_CONTRIBUTION || 0.5
  const seuil = params.CAMU_SEUIL || 500000
  const tauxCnssEmploye = params.CNSS_EMPLOYE || 4
  const plafondCnss = params.CNSS_PLAFOND || 1200000

  // Calcul cotisations sociales (part employé CNSS uniquement)
  const cotisationsSociales = Math.min(brutSocial, plafondCnss) * (tauxCnssEmploye / 100)

  // Base CAMU = salaireBrut - cotisations CNSS employé - seuil (500 000)
  const baseImposable = Math.max(0, brutSocial - cotisationsSociales - seuil)
  const contribution = Math.round(baseImposable * (taux / 100))

  return {
    employe: contribution,  // ✅ CAMU = Part salariale UNIQUEMENT
    employeur: 0,           // ✅ Pas de part patronale pour CAMU
    total: contribution
  }
}

// Calcul IRPP (Impôt sur le Revenu des Personnes Physiques) - Version DB
export async function calculateIRPP(
  tenantId: string,
  brutFiscal: number,
  chargesDeductibles: number = 0,
  quotientFamilial: number = 1,
  periode: Date = new Date()
): Promise<number> {
  const result = await BaremeIrppService.calculateIrpp(
    tenantId,
    brutFiscal,
    chargesDeductibles,
    quotientFamilial,
    periode
  )
  return result.irppTotal
}

// Calcul TUS (Taxe Unique sur les Salaires) - Version DB
// TUS = CHARGE PATRONALE versée à l'Administration Fiscale (4.125%)
export async function calculateTUS(
  tenantId: string,
  brutSocial: number,
  periode: Date = new Date()
): Promise<number> {
  const taux = await ParametresFiscauxService.getValue(tenantId, 'TUS_TAUX', periode)
  return Math.round(brutSocial * (taux / 100))
}

// Calcul du brut social (assiette CNSS/CAMU)
export function calculateBrutSocial(
  salaireBase: number,
  primesSoumises: number,
  avantagesNature: number = 0
): number {
  // Brut social = salaire + primes soumises + avantages en nature
  return salaireBase + primesSoumises + avantagesNature
}

// Calcul du brut fiscal (assiette IRPP)
export function calculateBrutFiscal(
  brutSocial: number,
  primesNonFiscales: number = 0
): number {
  // Brut fiscal = brut social - primes non fiscales (transport, panier, etc.)
  return Math.max(0, brutSocial - primesNonFiscales)
}

// Calcul complet des cotisations employé - Version DB
export async function calculateCotisationsEmploye(
  tenantId: string,
  brutSocial: number,
  brutFiscal: number,
  chargesDeductibles: number = 0,
  quotientFamilial: number = 1,
  periode: Date = new Date()
): Promise<{
  cnss: number
  camu: number
  irpp: number
  tol: number
  total: number
}> {
  const cnssResult = await calculateCNSS(tenantId, brutSocial, periode)
  const camuResult = await calculateCAMU(tenantId, brutSocial, periode)
  const irpp = await calculateIRPP(tenantId, brutFiscal, chargesDeductibles, quotientFamilial, periode)

  // TOL - Taxe sur les Ordures et Lieux (3550) - montant fixe
  // 1000 FCFA pour les locaux (3550), 5000 FCFA pour les expats (3560)
  const tol = 1000

  console.log('[DEBUG calculateCotisationsEmploye] TOL:', { tol })

  return {
    cnss: cnssResult.employe,
    camu: camuResult.employe,
    irpp,
    tol,
    total: cnssResult.employe + camuResult.employe + irpp + tol
  }
}

// Calcul complet des charges employeur - Version DB
// CHARGES EMPLOYEUR:
// - CNSS part employeur (8%)
// - Allocations familiales (10.03%)
// - Accident de travail (2.25%)
// - SS - Taxe unique sur salaire → Sécurité Sociale (3.375%)
// - TUS - Taxe unique sur salaire → Administration Fiscale (4.125%)
export async function calculateChargesEmployeur(
  tenantId: string,
  brutSocial: number,
  brutFiscal: number,
  periode: Date = new Date()
): Promise<{
  cnss: number
  allocationsFamiliales: number
  accidentsTravail: number
  taxeUniqueSS: number
  tus: number
  total: number
}> {
  const cnssResult = await calculateCNSS(tenantId, brutSocial, periode)

  // Allocations familiales (3110), Accidents de travail (3120), Taxe unique SS (3130)
  const params = await ParametresFiscauxService.getParametres(
    tenantId,
    ['AF_TAUX', 'AF_PLAFOND', 'AT_TAUX', 'AT_PLAFOND', 'TUS_SS_TAUX', 'TUS_TAUX'],
    periode
  )

  const plafondAlloc = params.AF_PLAFOND || 600000
  const tauxAlloc = params.AF_TAUX || 10.03
  const allocationsFamiliales = Math.round(Math.min(brutSocial, plafondAlloc) * (tauxAlloc / 100))

  // Accidents de travail (3120)
  const plafondAccident = params.AT_PLAFOND || 600000
  const tauxAccident = params.AT_TAUX || 2.25
  const accidentsTravail = Math.round(Math.min(brutSocial, plafondAccident) * (tauxAccident / 100))

  // SS - Taxe unique sur salaire → Sécurité Sociale (3130)
  const tauxTaxeUniqueSS = params.TUS_SS_TAUX || 3.375
  const taxeUniqueSS = Math.round(brutSocial * (tauxTaxeUniqueSS / 100))

  // TUS - Taxe unique sur salaire → Administration Fiscale (3530)
  const tauxTUS = params.TUS_TAUX || 4.125
  const tus = Math.round(brutSocial * (tauxTUS / 100))

  return {
    cnss: cnssResult.employeur,   // 8% CNSS employeur
    allocationsFamiliales,         // 10.03% Allocations familiales
    accidentsTravail,              // 2.25% Accidents de travail
    taxeUniqueSS,                  // 3.375% SS - Taxe unique → Sécurité Sociale
    tus,                           // 4.125% TUS → Administration Fiscale
    total: cnssResult.employeur + allocationsFamiliales + accidentsTravail + taxeUniqueSS + tus
  }
}

// Calcul du net à payer
export function calculateNetAPayer(
  brutFiscal: number,
  cotisationsEmploye: number,
  autresRetenues: number = 0
): number {
  return Math.max(0, brutFiscal - cotisationsEmploye - autresRetenues)
}

// Utilitaire: Simulation complète de paie - Version DB
export async function simulatePayroll(
  tenantId: string,
  salaireBase: number,
  primesSoumises: number = 0,
  primesNonFiscales: number = 0,
  chargesDeductibles: number = 0,
  autresRetenues: number = 0,
  quotientFamilial: number = 1,
  periode: Date = new Date()
) {
  const brutSocial = calculateBrutSocial(salaireBase, primesSoumises)
  const brutFiscal = calculateBrutFiscal(brutSocial, primesNonFiscales)

  const cotisationsEmploye = await calculateCotisationsEmploye(tenantId, brutSocial, brutFiscal, chargesDeductibles, quotientFamilial, periode)
  const chargesEmployeur = await calculateChargesEmployeur(tenantId, brutSocial, brutFiscal, periode)

  const netAPayer = calculateNetAPayer(brutFiscal, cotisationsEmploye.total, autresRetenues)

  const coutTotalEmployeur = brutSocial + chargesEmployeur.total

  return {
    brutSocial,
    brutFiscal,
    cotisationsEmploye,
    chargesEmployeur,
    netAPayer,
    coutTotalEmployeur,
    tauxCharges: ((chargesEmployeur.total / brutSocial) * 100).toFixed(1) + '%'
  }
}