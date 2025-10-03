'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Rubrique {
  code: string
  libelle: string
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ELEMENT_NON_IMPOSABLE'
  base: string
  taux: number | null
  formule: string
  imposable: boolean
  isActive: boolean
}

interface ChargesListProps {
  selectedRubriques: string[]
  selectedCharges: { [rubriqueCode: string]: number }
  availableRubriques: Rubrique[]
  onRemoveRubrique: (rubriqueCode: string) => void
  onAmountChange: (rubriqueCode: string, value: string) => void
}

export function ChargesList({
  selectedRubriques,
  selectedCharges,
  availableRubriques,
  onRemoveRubrique,
  onAmountChange
}: ChargesListProps) {
  const selectedRubriquesData = selectedRubriques
    .map(code => availableRubriques.find(r => r.code === code))
    .filter(Boolean) as Rubrique[]

  if (selectedRubriquesData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">Aucune charge fixe configurée</p>
        <p className="text-xs">Cliquez sur &quot;Ajouter une rubrique&quot; pour commencer</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {selectedRubriquesData.map((rubrique) => (
        <div
          key={rubrique.code}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-indigo-200"
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="font-medium text-sm">{rubrique.code}</span>
            <span className="text-sm text-gray-600">-</span>
            <span className="text-sm">{rubrique.libelle}</span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="0"
              value={selectedCharges[rubrique.code] ? selectedCharges[rubrique.code].toLocaleString('fr-FR') : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '')
                onAmountChange(rubrique.code, value)
              }}
              className="w-24 text-right border-indigo-200 focus:border-indigo-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveRubrique(rubrique.code)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}