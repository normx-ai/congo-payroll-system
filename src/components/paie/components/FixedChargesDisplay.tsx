'use client'

import { getRubriqueTypeColor, getRubriqueTypeLabel } from '../utils/rubrique-utils'

interface Rubrique {
  code: string
  libelle: string
  type: string
}

interface EmployeeChargeFixe {
  id: string
  employeeId: string
  rubriqueCode: string
  amount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
  chargesFixes?: EmployeeChargeFixe[]
}

interface FixedChargesDisplayProps {
  rubriques: Rubrique[]
  selectedEmployeeData?: Employee
}

export function FixedChargesDisplay({ rubriques, selectedEmployeeData }: FixedChargesDisplayProps) {
  if (rubriques.length === 0) return null

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Charges fixes (automatiques)
      </h3>
      <div className="space-y-3">
        {rubriques.map(rubrique => {
          const chargeFixe = selectedEmployeeData?.chargesFixes?.find(
            cf => cf.rubriqueCode === rubrique.code && cf.isActive
          )
          return (
            <div key={rubrique.code} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                    {getRubriqueTypeLabel(rubrique.type)}
                  </span>
                  <span className="font-medium">{rubrique.libelle}</span>
                  <span className="text-sm text-gray-500">({rubrique.code})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-40 text-right font-medium text-green-700">
                  {chargeFixe ? new Intl.NumberFormat('fr-FR').format(chargeFixe.amount) : '0'}
                </div>
                <div className="w-16 text-sm text-gray-500">
                  FCFA
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}