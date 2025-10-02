'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Exercise {
  id: string
  annee: number
  libelle: string
  isActif: boolean
}

interface PeriodSelectorProps {
  month: string
  year: string
  exercices: Exercise[]
  exercicesLoading: boolean
  onMonthChange: (month: string) => void
  onYearChange: (year: string) => void
}

const months = [
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

export function PeriodSelector({
  month,
  year,
  exercices,
  exercicesLoading,
  onMonthChange,
  onYearChange
}: PeriodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
        <Select value={month} onValueChange={onMonthChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map(m => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exercice</label>
        <Select value={year} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exercicesLoading ? (
              <SelectItem value="loading" disabled>Chargement...</SelectItem>
            ) : exercices.length === 0 ? (
              <SelectItem value="empty" disabled>Aucun exercice disponible</SelectItem>
            ) : (
              exercices.map(exercice => (
                <SelectItem key={exercice.id} value={exercice.annee.toString()}>
                  {exercice.libelle} {exercice.isActif && '(Actif)'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}