'use client'

import { Input } from '@/components/ui/input'
import { getRubriqueTypeColor, getRubriqueTypeLabel, RubriqueAmount } from '../utils/rubrique-utils'

interface Rubrique {
  code: string
  libelle: string
  type: string
}

interface ManualEntryRubriquesProps {
  rubriques: Rubrique[]
  amounts: RubriqueAmount[]
  onUpdateAmount: (rubriqueCode: string, amount: number) => void
}

export function ManualEntryRubriques({ rubriques, amounts, onUpdateAmount }: ManualEntryRubriquesProps) {
  if (rubriques.length === 0) return null

  return (
    <div>
      <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Montants à saisir manuellement
      </h3>
      <div className="space-y-3">
        {rubriques.map(rubrique => (
          <div key={rubrique.code} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                  {getRubriqueTypeLabel(rubrique.type)}
                </span>
                <span className="font-medium">{rubrique.libelle}</span>
                <span className="text-sm text-gray-500">({rubrique.code})</span>
              </div>
            </div>
            <div className="w-40">
              <Input
                type="number"
                placeholder="0"
                value={amounts.find(a => a.rubriqueCode === rubrique.code)?.amount || ''}
                onChange={(e) => onUpdateAmount(rubrique.code, parseFloat(e.target.value) || 0)}
                className="text-right"
              />
            </div>
            <div className="w-16 text-sm text-gray-500">
              FCFA
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}