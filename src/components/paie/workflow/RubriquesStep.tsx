'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Settings, Search, ChevronLeft } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'
import { RubriqueCategory } from '../RubriqueCategory'

interface RubriquesStepProps {
  onNext: (skipAmounts?: boolean) => void
  onBack?: () => void
}

export function RubriquesStep({ onNext, onBack }: RubriquesStepProps) {
  const {
    rubriques,
    toggleRubrique,
    expandedCategories,
    toggleCategory,
    gainsBreut,
    cotisations,
    gainsNonSoumis,
    retenuesNonSoumises
  } = useRubriques()

  const [searchTerm, setSearchTerm] = useState('')

  // Fonction de filtrage des rubriques avec support des wildcards
  const filterRubriques = (rubriquesList: typeof rubriques) => {
    if (!searchTerm.trim()) return rubriquesList

    const searchLower = searchTerm.toLowerCase()

    // Support des wildcards : si le terme se termine par *, on fait une recherche "commence par"
    if (searchTerm.endsWith('*')) {
      const prefix = searchTerm.slice(0, -1).toLowerCase()
      return rubriquesList.filter(r =>
        r.code.toLowerCase().startsWith(prefix) ||
        r.libelle.toLowerCase().startsWith(prefix)
      )
    }

    // Recherche normale (contient)
    return rubriquesList.filter(r =>
      r.code.toLowerCase().includes(searchLower) ||
      r.libelle.toLowerCase().includes(searchLower)
    )
  }

  // Appliquer le filtre à chaque catégorie
  const filteredGainsBreut = filterRubriques(gainsBreut)
  const filteredCotisations = filterRubriques(cotisations)
  const filteredGainsNonSoumis = filterRubriques(gainsNonSoumis)
  const filteredRetenuesNonSoumises = filterRubriques(retenuesNonSoumises)

  const hasActiveRubriques = rubriques.some(r => r.isActive)
  const manualEntryRubriques = rubriques.filter(r => r.isActive && r.formule === '')

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-600">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="px-2 py-1.5 h-auto"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Settings className="w-5 h-5 text-indigo-600" />
              Étape 2: Ajout des Rubriques
            </CardTitle>
          </div>
          {hasActiveRubriques && (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-600">
                {rubriques.filter(r => r.isActive).length} rubriques sélectionnées
              </p>
              <Button
                onClick={() => onNext(manualEntryRubriques.length === 0)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 h-auto text-sm"
              >
                Suivant: Paramètres
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Champ de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher par code ou nom (ex: 6* pour tous les codes 6xxx)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-1">
              Recherche : &quot;{searchTerm}&quot;
            </p>
          )}
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-4">
            {filteredGainsBreut.length > 0 && (
              <RubriqueCategory
                type="GAIN_BRUT"
                rubriques={filteredGainsBreut}
                expanded={expandedCategories.GAIN_BRUT}
                onToggleExpanded={() => toggleCategory('GAIN_BRUT')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {filteredCotisations.length > 0 && (
              <RubriqueCategory
                type="COTISATION"
                rubriques={filteredCotisations}
                expanded={expandedCategories.COTISATION}
                onToggleExpanded={() => toggleCategory('COTISATION')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {filteredGainsNonSoumis.length > 0 && (
              <RubriqueCategory
                type="GAIN_NON_SOUMIS"
                rubriques={filteredGainsNonSoumis}
                expanded={expandedCategories.GAIN_NON_SOUMIS}
                onToggleExpanded={() => toggleCategory('GAIN_NON_SOUMIS')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {filteredRetenuesNonSoumises.length > 0 && (
              <RubriqueCategory
                type="RETENUE_NON_SOUMISE"
                rubriques={filteredRetenuesNonSoumises}
                expanded={expandedCategories.RETENUE_NON_SOUMISE}
                onToggleExpanded={() => toggleCategory('RETENUE_NON_SOUMISE')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {searchTerm &&
             filteredGainsBreut.length === 0 &&
             filteredCotisations.length === 0 &&
             filteredGainsNonSoumis.length === 0 &&
             filteredRetenuesNonSoumises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune rubrique trouvée pour &quot;{searchTerm}&quot;</p>
                <p className="text-sm mt-1">Essayez avec un autre terme de recherche</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}