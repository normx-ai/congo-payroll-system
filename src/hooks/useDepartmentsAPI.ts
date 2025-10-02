'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Department {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export function useDepartmentsAPI() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les départements depuis l'API
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

  // Créer un département
  const createDepartment = useCallback(async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du département')
      }

      const newDepartment = await response.json()
      await loadDepartments() // Recharger la liste
      return newDepartment
    } catch (err) {
      console.error('Erreur création département:', err)
      throw err
    }
  }, [loadDepartments])

  // Modifier un département
  const updateDepartment = useCallback(async (id: string, data: Partial<Department>) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du département')
      }

      await loadDepartments() // Recharger la liste
    } catch (err) {
      console.error('Erreur modification département:', err)
      throw err
    }
  }, [loadDepartments])

  // Supprimer un département
  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du département')
      }

      await loadDepartments() // Recharger la liste
    } catch (err) {
      console.error('Erreur suppression département:', err)
      throw err
    }
  }, [loadDepartments])

  // Charger au montage
  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  return {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments: loadDepartments
  }
}