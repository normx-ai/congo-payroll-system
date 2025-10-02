'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface ExerciceContextType {
  hasActiveExercice: boolean
  exercices: Array<{
    id: string
    libelle: string
    annee: number
    dateDebut: string
    dateFin: string
  }>
  loading: boolean
  error: string | null
  refresh: () => void
}

const ExerciceContext = createContext<ExerciceContextType | undefined>(undefined)

interface ExerciceProviderProps {
  children: ReactNode
}

export function ExerciceProvider({ children }: ExerciceProviderProps) {
  const { data: session } = useSession()
  const [status, setStatus] = useState<{
    hasActiveExercice: boolean
    exercices: Array<{
      id: string
      libelle: string
      annee: number
      dateDebut: string
      dateFin: string
    }>
    loading: boolean
    error: string | null
  }>({
    hasActiveExercice: false,
    exercices: [],
    loading: true,
    error: null
  })

  const fetchExercices = useCallback(async () => {
    if (!session?.user) {
      setStatus({
        hasActiveExercice: false,
        exercices: [],
        loading: false,
        error: null
      })
      return
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/exercices')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des exercices')
      }

      const data = await response.json()
      const exercices = data.exercices || []

      setStatus({
        hasActiveExercice: exercices.length > 0,
        exercices,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Erreur ExerciceContext:', error)
      setStatus({
        hasActiveExercice: false,
        exercices: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    }
  }, [session])

  useEffect(() => {
    fetchExercices()
  }, [fetchExercices])

  const value = {
    ...status,
    refresh: fetchExercices
  }

  return (
    <ExerciceContext.Provider value={value}>
      {children}
    </ExerciceContext.Provider>
  )
}

export function useExerciceContext() {
  const context = useContext(ExerciceContext)
  if (context === undefined) {
    throw new Error('useExerciceContext must be used within an ExerciceProvider')
  }
  return context
}