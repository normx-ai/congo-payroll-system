'use client'

import { useEffect } from 'react'

export function DepartmentsFixer() {
  useEffect(() => {
    // Générer un UUID valide
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    // Récupérer les départements existants
    const savedDepartments = localStorage.getItem('departments')

    if (savedDepartments) {
      try {
        const departments = JSON.parse(savedDepartments)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        let needsUpdate = false

        // Vérifier et corriger les IDs
        const fixedDepartments = departments.map((dept: { id: string; name: string; description?: string; isActive: boolean }) => {
          if (!uuidRegex.test(dept.id)) {
            console.log(`Correction du département "${dept.name}" - ancien ID: ${dept.id}`)
            needsUpdate = true
            return {
              ...dept,
              id: generateUUID()
            }
          }
          return dept
        })

        if (needsUpdate) {
          // Sauvegarder les départements corrigés
          localStorage.setItem('departments', JSON.stringify(fixedDepartments))
          // Déclencher l'événement de mise à jour
          window.dispatchEvent(new Event('departmentsChanged'))
          console.log('Départements corrigés:', fixedDepartments)
        }
      } catch (error) {
        console.error('Erreur lors de la correction des départements:', error)
      }
    }
  }, [])

  return null
}