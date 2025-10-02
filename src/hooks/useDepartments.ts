'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/departments')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des départements')
      }

      const data = await response.json()
      setDepartments(data.filter((dept: Department) => dept.isActive))
      setError(null)
    } catch (err) {
      setError('Erreur lors du chargement des départements')
      console.error('Erreur départements:', err)
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDepartments()

    // Écoute personnalisée pour les changements
    const handleDepartmentsChanged = () => {
      loadDepartments()
    }

    window.addEventListener('departmentsChanged', handleDepartmentsChanged)

    return () => {
      window.removeEventListener('departmentsChanged', handleDepartmentsChanged)
    }
  }, [loadDepartments])

  return { departments, loading, error, refreshDepartments: loadDepartments }
}