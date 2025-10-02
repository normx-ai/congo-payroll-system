/**
 * Types pour génération de bulletins de paie
 * Fichier: <150 lignes
 */

import { BulletinPaie } from '../payroll'

export type RubriqueType = 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'

export interface ModeCalcul {
  readonly type: 'TAUX' | 'MONTANT_FIXE' | 'FORMULE'
  readonly valeur: number | string
}

export interface EntrepriseInfo {
  readonly nom: string
  readonly adresse: string
  readonly telephone?: string
  readonly email?: string
  readonly nui?: string
  readonly rccm?: string
  readonly cnssEmployeur?: string
}

export interface EmployeeInfo {
  readonly nom: string
  readonly prenom: string
  readonly matricule: string
  readonly poste: string
  readonly categorie: string
  readonly echelon: number
  readonly dateEmbauche: string
  readonly cnssNumero?: string
  readonly nui?: string
  readonly situationFamiliale: string
  readonly enfantsACharge: number
}

export interface BulletinTemplate {
  readonly entreprise: EntrepriseInfo
  readonly employe: EmployeeInfo
  readonly periode: string
  readonly bulletin: BulletinPaie
  readonly options: BulletinOptions
}

export interface BulletinOptions {
  readonly afficherChargesEmployeur: boolean
  readonly afficherCoutTotal: boolean
  readonly masquerRubriquesNulles: boolean
  readonly grouperParType: boolean
}

export interface RubriquePersonnalisee {
  readonly code: string
  readonly libelle: string
  readonly type: 'gain' | 'retenue'
  readonly modeCalcul: 'fixe' | 'pourcentage' | 'formule'
  readonly montant?: number
  readonly pourcentage?: number
  readonly baseCalcul?: 'salaireBase' | 'brutSocial' | 'brutFiscal'
  readonly soumisCotisations?: boolean
}

// Export des types du moteur de paie pour compatibilité
export type { BulletinPaie, RubriqueEmploye } from '../payroll'