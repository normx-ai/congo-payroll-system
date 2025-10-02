'use client'

import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExerciceMonths, type ExerciceMonth } from '@/hooks/useExerciceMonths'

interface MonthSelectorProps {
  selectedMonth: string
  onMonthSelect: (month: string) => void
  className?: string
}

export function MonthSelector({ selectedMonth, onMonthSelect, className }: MonthSelectorProps) {
  const { months, currentMonthData, exerciceActif } = useExerciceMonths()

  if (!exerciceActif) {
    return (
      <div className={cn("w-72 bg-white rounded-lg shadow-sm border border-gray-200", className)}>
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Sélection du Mois
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center text-gray-500 py-8">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">Aucun exercice actif</p>
            <p className="text-xs text-gray-400 mt-1">
              Créez un exercice dans les paramètres
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-72 bg-white rounded-lg shadow-sm border border-gray-200", className)}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Sélection du Mois
        </h3>
        <div className="mt-2 text-sm text-gray-600">
          <div className="font-medium">{exerciceActif.libelle}</div>
        </div>
      </div>

      {/* Liste des mois */}
      <div className="p-2 max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {months.map((month: ExerciceMonth) => {
            const isSelected = selectedMonth === month.value
            const isCurrent = month.isCurrentMonth

            return (
              <button
                key={month.value}
                onClick={() => onMonthSelect(month.value)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
                  isSelected && "bg-indigo-50 border border-indigo-200 shadow-sm",
                  !isSelected && "hover:shadow-sm"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : isCurrent
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    )}>
                      {month.monthNumber}
                    </div>

                    <div>
                      <div className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-indigo-900" : "text-gray-900"
                      )}>
                        {month.label}
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-1 text-xs text-indigo-600 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Mois actuel
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    )}
                    {/* Ici on pourrait ajouter des indicateurs de statut (traité, en cours, etc.) */}
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected
                        ? "bg-indigo-600"
                        : isCurrent
                        ? "bg-indigo-400"
                        : "bg-gray-300"
                    )} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Pied de page avec informations */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-600">
          <div className="flex items-center justify-start gap-12">
            <span>{months.length} mois disponibles</span>
            {currentMonthData && (
              <span className="text-indigo-600 font-medium">
                {currentMonthData.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}