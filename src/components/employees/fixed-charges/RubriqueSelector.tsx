'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Rubrique {
  code: string
  libelle: string
  type: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'
  base: string
  taux: number | null
  formule: string
  imposable: boolean
  isActive: boolean
}

interface RubriqueSelectorProps {
  availableRubriques: Rubrique[]
  selectedRubriques: string[]
  onAddRubrique: (rubriqueCode: string) => void
  showAddMenu: boolean
  onToggleAddMenu: () => void
}

export function RubriqueSelector({
  availableRubriques,
  selectedRubriques,
  onAddRubrique,
  showAddMenu,
  onToggleAddMenu
}: RubriqueSelectorProps) {
  const unselectedRubriques = availableRubriques.filter(
    r => !selectedRubriques.includes(r.code)
  )

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Rubriques de charges fixes</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAddMenu}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter une rubrique
        </Button>
      </div>

      {showAddMenu && (
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <h5 className="text-sm font-medium mb-2">Sélectionner une rubrique :</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {unselectedRubriques.length === 0 ? (
              <p className="text-sm text-gray-500">Toutes les rubriques sont déjà ajoutées</p>
            ) : (
              unselectedRubriques.map((rubrique) => (
                <button
                  key={rubrique.code}
                  onClick={() => onAddRubrique(rubrique.code)}
                  className="w-full text-left p-2 hover:bg-white rounded border text-sm"
                >
                  <span className="font-medium">{rubrique.code}</span> - {rubrique.libelle}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}