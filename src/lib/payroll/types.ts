// Types pour le moteur de paie - NORM PAIE
// Fichier: 45 lignes

// Types depuis l'interface des rubriques
export type RubriqueType = 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
export interface ModeCalcul {
  type: 'TAUX' | 'MONTANT_FIXE' | 'FORMULE'
  valeur: number | string
}

export interface RubriqueEmploye {
  code: string
  libelle: string
  type: RubriqueType
  modeCalcul: ModeCalcul
  montant: number
  soumisCnss: boolean
  soumisIrpp: boolean
  nbHeures?: number
  tauxHoraire?: number
  // Nouveaux champs pour l'unification
  base?: number
  tauxEmploye?: number
  tauxEmployeur?: number
  montantEmploye?: number
  montantEmployeur?: number
}

export interface EmployeePaieData {
  employeeId: string
  tenantId: string
  periode: string // YYYY-MM
  baseSalary: number
  ancienneteAnnees: number
  ancienneteMois: number
  joursTravailles: number
  rubriquesSaisies: Array<{
    code: string
    montant: number
    nbHeures?: number
  }>
  chargesDeductibles?: number
  quotientFamilial?: number
  statutEmploye?: 'actif' | 'demissionnaire' | 'licencie'
  maritalStatus?: string
  childrenCount?: number
}

export interface CotisationsEmploye {
  cnss: number
  camu: number
  irpp: number
  total: number
}

export interface ChargesEmployeur {
  cnss: number                  // CNSS part employeur (8%)
  allocationsFamiliales: number // Allocations familiales (10.03%)
  accidentsTravail: number      // Accidents de travail (2.25%)
  taxeUniqueSS: number          // SS - Taxe unique → Sécurité Sociale (3.375%)
  tus: number                   // TUS → Administration Fiscale (4.125%)
  total: number
}

export interface BulletinPaie {
  employeeId: string
  periode: string
  dateCalcul: Date
  gains: {
    rubriques: RubriqueEmploye[]
    totalBrutSocial: number
    totalBrutFiscal: number
    totalGainsNonSoumis: number
    totalGains: number
  }
  retenues: {
    cotisationsEmploye: CotisationsEmploye
    autresRetenues: {
      rubriques: RubriqueEmploye[]
      total: number
    }
    totalRetenues: number
  }
  cotisations: {
    rubriques: RubriqueEmploye[]
    totalCotisations: number
  }
  chargesEmployeur: ChargesEmployeur
  netAPayer: number
  coutTotalEmployeur: number
}