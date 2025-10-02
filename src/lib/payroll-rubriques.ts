import { rubriquesDiponibles } from '@/components/parametres/rubriquesData'

export const RUBRIQUES_PAIE = rubriquesDiponibles

export interface Rubrique {
  code: string
  libelle: string
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'
  base: string
  taux: number | null
  formule: string
  imposable: boolean
  isActive: boolean
}

export type RubriqueType = Rubrique['type']

export interface ModeCalcul {
  type: 'TAUX' | 'MONTANT_FIXE' | 'FORMULE'
  valeur: number | string
}

// Export pour compatibilité avec les anciens imports
export const RUBRIQUES_GAINS = rubriquesDiponibles.filter(r => r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS')
export const RUBRIQUES_COTISATIONS = rubriquesDiponibles.filter(r => r.type === 'COTISATION' || r.type === 'RETENUE_NON_SOUMISE')