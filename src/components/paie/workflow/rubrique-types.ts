/**
 * Types pour les rubriques de paie
 */

export interface Rubrique {
  code: string
  libelle: string
  type: string
  taux?: number | null
  formule?: string
  isActive?: boolean
}