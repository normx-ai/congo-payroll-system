'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useExercices } from '@/hooks/useExercices'

interface PeriodStepProps {
  month: string
  year: string
  onUpdatePeriod: (month: string, year: string) => void
  onNext: () => void
}

export function PeriodStep({ month, year, onUpdatePeriod, onNext }: PeriodStepProps) {
  const { exerciceActif, loading, error } = useExercices()
  const [selectedMonth, setSelectedMonth] = useState(month)
  const [selectedYear, setSelectedYear] = useState(year)

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
    { value: '12', label: 'Décembre' }
  ]

  // Utiliser l'exercice actif pour déterminer l'année
  useEffect(() => {
    if (exerciceActif) {
      setSelectedYear(exerciceActif.annee.toString())
    }
  }, [exerciceActif])

  const handleNext = () => {
    onUpdatePeriod(selectedMonth, selectedYear)
    onNext()
  }

  if (loading) {
    return (
      <Card className="shadow-sm border-l-4 border-l-indigo-600">
        <CardContent className="p-6 text-center">
          <p>Chargement des exercices...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !exerciceActif) {
    return (
      <Card className="shadow-sm border-l-4 border-l-red-600">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Aucun exercice actif trouvé</p>
              <p className="text-sm text-gray-600 mt-1">
                Veuillez créer et activer un exercice dans les paramètres avant de traiter la paie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Sélectionner la Période de Paie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Exercice actif :</strong> {exerciceActif.annee} - {exerciceActif.libelle}
            </p>
            {exerciceActif.dateDebut && exerciceActif.dateFin && (
              <p className="text-xs text-blue-700 mt-1">
                Du {new Date(exerciceActif.dateDebut).toLocaleDateString('fr-FR')} au {new Date(exerciceActif.dateFin).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mois de paie
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-indigo-50 p-3 rounded-md">
            <p className="text-sm text-indigo-900">
              Période sélectionnée : <strong>{months.find(m => m.value === selectedMonth)?.label} {exerciceActif.annee}</strong>
            </p>
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Continuer
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}