'use client'

import { Input } from '@/components/ui/input'

interface Rubrique {
  code: string
  libelle: string
  type: string
  formule: string
  isActive: boolean
}

interface ManualRubriquesProps {
  rubriques: Rubrique[]
  localAmounts: { [key: string]: number }
  onAmountChange: (rubriqueCode: string, value: string) => void
}

export function ManualRubriques({
  rubriques,
  localAmounts,
  onAmountChange
}: ManualRubriquesProps) {
  const manualEntryRubriques = rubriques.filter(r => r.isActive && r.formule === '')

  if (manualEntryRubriques.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune rubrique à saisie manuelle disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Saisie manuelle des montants</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {manualEntryRubriques.map((rubrique) => (
          <div key={rubrique.code} className="space-y-2">
            <label className="block text-sm font-medium">
              {rubrique.code} - {rubrique.libelle}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={localAmounts[rubrique.code] || ''}
                onChange={(e) => onAmountChange(rubrique.code, e.target.value)}
                className="text-right"
                min="0"
              />
              <span className="text-sm text-gray-500 min-w-[40px]">FCFA</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}