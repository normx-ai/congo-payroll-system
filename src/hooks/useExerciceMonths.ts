'use client'

import { useMemo } from 'react'
import { useExercices } from './useExercices'

export interface ExerciceMonth {
  value: string // Format: YYYY-MM
  label: string // Format: Janvier 2025
  monthNumber: number // 1-12
  year: number
  isCurrentMonth: boolean
}

export function useExerciceMonths() {
  const { exerciceActif } = useExercices()

  const months = useMemo(() => {
    if (!exerciceActif) return []

    const startDate = new Date(exerciceActif.dateDebut)
    const endDate = new Date(exerciceActif.dateFin)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Septembre', 'Août', 'Octobre', 'Novembre', 'Décembre'
    ]

    const exerciceMonths: ExerciceMonth[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const monthNumber = current.getMonth() + 1
      const year = current.getFullYear()
      const monthKey = `${year}-${monthNumber.toString().padStart(2, '0')}`

      exerciceMonths.push({
        value: monthKey,
        label: `${monthNames[current.getMonth()]} ${year}`,
        monthNumber,
        year,
        isCurrentMonth: monthNumber === currentMonth && year === currentYear
      })

      // Passer au mois suivant
      current.setMonth(current.getMonth() + 1)
    }

    // Les mois sont déjà dans l'ordre de l'exercice (du début à la fin)
    return exerciceMonths
  }, [exerciceActif])

  const currentMonthData = useMemo(() => {
    return months.find(month => month.isCurrentMonth) || months[0]
  }, [months])

  return {
    months,
    currentMonthData,
    exerciceActif,
    hasExercice: !!exerciceActif
  }
}