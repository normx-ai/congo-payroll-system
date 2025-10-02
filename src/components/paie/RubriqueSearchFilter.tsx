'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface RubriqueSearchFilterProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: 'ALL' | 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE'
  setSelectedCategory: (category: 'ALL' | 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE') => void
  counts: {
    total: number
    gainsBreut: number
    cotisations: number
    gainsNonSoumis: number
    retenuesNonSoumises: number
  }
  onToggleAllCategory: (category: 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE', active: boolean) => void
  onResetToDefaults: () => void
}

export function RubriqueSearchFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  counts,
  onResetToDefaults
}: RubriqueSearchFilterProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une rubrique..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' | 'ALL')}
          className="px-3 py-2 border rounded-md min-w-[180px]"
        >
          <option value="ALL">Toutes ({counts.total})</option>
          <option value="GAIN_BRUT">Gains du Brut ({counts.gainsBreut})</option>
          <option value="COTISATION">Cotisations ({counts.cotisations})</option>
          <option value="GAIN_NON_SOUMIS">Gains Non Soumis ({counts.gainsNonSoumis})</option>
          <option value="RETENUE_NON_SOUMISE">Retenues Non Soumises ({counts.retenuesNonSoumises})</option>
        </select>
      </div>

      <div className="flex gap-2 justify-between items-center flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ALL')}
          >
            Toutes
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'GAIN_BRUT' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('GAIN_BRUT')}
          >
            Gains Brut
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'COTISATION' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('COTISATION')}
          >
            Cotisations
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'GAIN_NON_SOUMIS' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('GAIN_NON_SOUMIS')}
          >
            Gains N.S.
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === 'RETENUE_NON_SOUMISE' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('RETENUE_NON_SOUMISE')}
          >
            Retenues N.S.
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={onResetToDefaults}>
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}