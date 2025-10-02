export interface Exercice {
  id: string
  libelle: string
  annee: number
  dateDebut: string // Format: YYYY-MM-DD
  dateFin: string   // Format: YYYY-MM-DD
  isActif: boolean
  isClos: boolean
  description?: string
}

export const exercicesDisponibles: Exercice[] = []

export const getExerciceActif = (): Exercice | undefined => {
  return exercicesDisponibles.find(ex => ex.isActif)
}

export const getExercicesOuverts = (): Exercice[] => {
  return exercicesDisponibles.filter(ex => !ex.isClos)
}

export const getExerciceByAnnee = (annee: number): Exercice | undefined => {
  return exercicesDisponibles.find(ex => ex.annee === annee)
}