'use client'

import { AlertTriangle } from 'lucide-react'

interface Rubrique {
  code: string
  libelle: string
  type: string
  formule: string
  isActive: boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  salaireBase?: number
}

interface CalculatedRubriquesProps {
  rubriques: Rubrique[]
  selectedEmployee: Employee | undefined
  calculateRubriqueValue: (rubrique: Rubrique) => number
  formatAmount: (amount: number) => string
}

export function CalculatedRubriques({
  rubriques,
  selectedEmployee,
  calculateRubriqueValue,
  formatAmount
}: CalculatedRubriquesProps) {
  const calculatedRubriques = rubriques.filter(r => r.isActive && r.formule !== '')

  if (calculatedRubriques.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Rubriques calculées automatiquement</h3>

      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Information</p>
            <p className="text-sm text-blue-700">
              Ces rubriques sont calculées automatiquement selon leurs formules.
              {selectedEmployee && (
                <>
                  <br />Salaire de base utilisé : {formatAmount(selectedEmployee.salaireBase || 150000)}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculatedRubriques.map((rubrique) => (
            <div key={rubrique.code} className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{rubrique.code}</p>
                  <p className="text-sm text-gray-600">{rubrique.libelle}</p>
                </div>
                <p className="font-semibold text-green-600">
                  {formatAmount(calculateRubriqueValue(rubrique))}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formule : {rubrique.formule || 'Calcul automatique'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}