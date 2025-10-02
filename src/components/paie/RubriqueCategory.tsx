'use client'

import { ChevronDown, ChevronUp, Plus, Minus, Coins } from 'lucide-react'
import type { Rubrique } from '@/components/parametres/rubriquesData'

type RubriqueUI = Rubrique & {
  // isActive déjà dans Rubrique - pas de champs supplémentaires nécessaires
}

interface RubriqueCategoryProps {
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'
  rubriques: RubriqueUI[]
  expanded: boolean
  onToggleExpanded: () => void
  onToggleRubrique: (code: string) => void
}

const categoryConfig = {
  GAIN_BRUT: {
    icon: Plus,
    color: 'green',
    title: 'Éléments Imposables'
  },
  COTISATION: {
    icon: Minus,
    color: 'red',
    title: 'Cotisations'
  },
  GAIN_NON_SOUMIS: {
    icon: Coins,
    color: 'blue',
    title: 'Éléments Non Imposables'
  },
  RETENUE_NON_SOUMISE: {
    icon: Minus,
    color: 'orange',
    title: 'Retenues'
  }
}

export function RubriqueCategory({
  type,
  rubriques,
  expanded,
  onToggleExpanded,
  onToggleRubrique
}: RubriqueCategoryProps) {
  const config = categoryConfig[type]
  const Icon = config.icon
  const activeCount = rubriques.filter(r => r.isActive).length

  return (
    <div>
      <div
        className={`font-semibold text-${config.color}-700 mb-2 flex items-center gap-2 cursor-pointer hover:text-${config.color}-800`}
        onClick={onToggleExpanded}
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        <Icon className="w-4 h-4" />
        {config.title} ({activeCount}/{rubriques.length})
      </div>

      {expanded && (
        <div className="space-y-1 ml-2">
          {rubriques.map(rubrique => (
            <div
              key={rubrique.code}
              className={`flex items-center justify-between p-2 rounded text-xs ${
                rubrique.isActive
                  ? `bg-${config.color}-50 border border-${config.color}-200`
                  : 'bg-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={rubrique.isActive}
                  onChange={() => onToggleRubrique(rubrique.code)}
                  className="rounded flex-shrink-0"
                />
                <span className={`font-mono font-medium text-${config.color}-700 flex-shrink-0`}>
                  {rubrique.code}
                </span>
                <span className="truncate" title={rubrique.libelle}>
                  {rubrique.libelle}
                </span>
                {rubrique.code.startsWith('1') && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                    Imposable
                  </span>
                )}
                {rubrique.code.startsWith('3') && (
                  <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                    Cotisation
                  </span>
                )}
                {rubrique.code.startsWith('5') && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                    Non imposable
                  </span>
                )}
                {rubrique.code.startsWith('6') && (
                  <span className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                    Retenue
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                {rubrique.taux && <span>{rubrique.taux}%</span>}
                <span className="text-gray-400">•</span>
                <span>{rubrique.base}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}