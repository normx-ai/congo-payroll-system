/**
 * Types et interfaces legacy pour compatibilité
 */

import { UnifiedEmployee } from './index'
import { Employee as TypesEmployee } from '../../types/employee'

// Types d'entrée supportés pour legacy adapter
export type LegacyEmployeeInput = UnifiedEmployee | TypesEmployee

// Interface legacy conservée pour compatibilité
export interface PayrollCalculation {
  employeeId: string
  employeeName: string
  firstName?: string
  lastName?: string
  employeeCode: string
  position: string
  salaireBase?: number
  totalGains: number
  totalRetenues: number
  totalAvantages?: number
  salaireNet: number
  cotisationsEmployeur: number
  employeeData?: {
    dateEmbauche?: string
    departement?: string
    service?: string
    qualification?: string
    categorie?: string
    situationFamiliale?: string
    nombreEnfants?: number
    nombreParts?: number
    indice?: string
    niveau?: string
    niu?: string
    numeroCNSS?: string
    anciennete?: string
  }
  rubriques: {
    gains: Array<{
      code: string
      designation: string
      montant: number
      quantite?: number
      taux?: string
      base?: number
      type?: 'GAIN_BRUT' | 'GAIN_NON_SOUMIS'
    }>
    retenues: Array<{
      code: string
      designation: string
      montant: number
      base?: number
      taux?: string
      chargePatronale?: number
      type?: 'COTISATION' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
    }>
    autresRetenues?: Array<{
      code: string
      designation: string
      montant: number
      type?: 'ELEMENT_NON_IMPOSABLE'
    }>
  }
  details?: {
    gains: Array<{code: string, libelle: string, montant: number}>
    retenues: Array<{code: string, libelle: string, montant: number}>
    avantages: Array<{code: string, libelle: string, montant: number}>
  }
}

// Export de l'interface Employee legacy (sera déprécié)
export interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
  anciennete?: number
  categorieProfessionnelle?: number
  echelon?: number
  conventionCollective?: string
}