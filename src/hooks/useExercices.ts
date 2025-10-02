import { useState, useEffect, useMemo } from 'react'
import { useExerciceContext } from '@/contexts/ExerciceContext'
import type { Exercice } from '@/components/parametres/exercicesData'

export function useExercices() {
  const { refresh: refreshContext } = useExerciceContext()
  const [exercices, setExercices] = useState<Exercice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExercices()
  }, [])

  const fetchExercices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/exercices')
      if (response.ok) {
        const data = await response.json()
        setExercices(data.exercices || [])
        setError(null)
      } else {
        throw new Error('Erreur lors du chargement des exercices')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setExercices([])
    } finally {
      setLoading(false)
    }
  }

  const exerciceActif = useMemo(() => {
    return exercices.find(ex => ex.isActif)
  }, [exercices])

  const exercicesOuverts = useMemo(() => {
    return exercices.filter(ex => !ex.isClos)
  }, [exercices])

  const exercicesPourPaie = useMemo(() => {
    // Pour la paie, on propose les exercices ouverts (non clos)
    return exercicesOuverts.sort((a, b) => b.annee - a.annee) // Plus récent en premier
  }, [exercicesOuverts])

  const activerExercice = async (id: string) => {
    try {
      const response = await fetch(`/api/exercices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' })
      })

      if (response.ok) {
        await fetchExercices() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur activation exercice:', error)
    }
  }

  const cloturerExercice = async (id: string) => {
    try {
      const response = await fetch(`/api/exercices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' })
      })

      if (response.ok) {
        await fetchExercices()
      }
    } catch (error) {
      console.error('Erreur clôture exercice:', error)
    }
  }

  const ouvrirExercice = async (id: string) => {
    try {
      const response = await fetch(`/api/exercices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reopen' })
      })

      if (response.ok) {
        await fetchExercices()
      }
    } catch (error) {
      console.error('Erreur réouverture exercice:', error)
    }
  }

  const ajouterExercice = async (nouvelExercice: Omit<Exercice, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>) => {
    try {
      const response = await fetch('/api/exercices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nouvelExercice)
      })

      if (response.ok) {
        await fetchExercices()
        refreshContext() // Rafraîchir le contexte global
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de la création')
        return false
      }
    } catch (error) {
      console.error('Erreur ajout exercice:', error)
      setError('Erreur lors de la création de l\'exercice')
      return false
    }
  }

  const getExerciceParAnnee = (annee: number): Exercice | undefined => {
    return exercices.find(ex => ex.annee === annee)
  }

  const counts = {
    total: exercices.length,
    actifs: exercices.filter(ex => ex.isActif).length,
    ouverts: exercices.filter(ex => !ex.isClos).length,
    clos: exercices.filter(ex => ex.isClos).length
  }

  return {
    exercices,
    exerciceActif,
    exercicesOuverts,
    exercicesPourPaie,
    counts,
    loading,
    error,
    fetchExercices,
    activerExercice,
    cloturerExercice,
    ouvrirExercice,
    ajouterExercice,
    getExerciceParAnnee
  }
}