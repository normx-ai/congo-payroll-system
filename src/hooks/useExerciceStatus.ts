'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface ExerciceStatus {
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

export function useExerciceStatus(): ExerciceStatus {
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
      console.error('Erreur useExerciceStatus:', error)
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

  return {
    ...status,
    refresh: fetchExercices
  }
}