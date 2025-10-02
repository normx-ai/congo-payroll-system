'use client'

import { Search, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import { RubriqueSearchFilter } from './RubriqueSearchFilter'
import { RubriqueCategory } from './RubriqueCategory'
import { useRubriques } from '@/contexts/RubriquesContext'
import { useToast } from '@/components/ui/toast'

export function RubriquesManager() {
  const { showToast, ToastContainer } = useToast()

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    expandedCategories,
    filteredRubriques,
    gainsBreut,
    cotisations,
    gainsNonSoumis,
    retenuesNonSoumises,
    counts,
    toggleRubrique,
    toggleCategory,
    toggleAllInCategory,
    resetToDefaults,
    getTotalActives
  } = useRubriques()

  const handleValidateChanges = () => {
    showToast(`Configuration validée ! ${getTotalActives()} rubriques activées.`, 'success')
  }

  return (
    <>
      <ToastContainer />
      <Card className="shadow-sm border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-900">
              <Coins className="w-5 h-5 text-indigo-600" />
              Gestion des Rubriques
            </span>
            <Button
              onClick={handleValidateChanges}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Valider
            </Button>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <RubriqueSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          counts={counts}
          onToggleAllCategory={toggleAllInCategory}
          onResetToDefaults={resetToDefaults}
        />

        <ScrollArea className="h-96">
          <div className="space-y-4">
            {/* Gains du Brut */}
            {(selectedCategory === 'ALL' || selectedCategory === 'GAIN_BRUT') && gainsBreut.length > 0 && (
              <RubriqueCategory
                type="GAIN_BRUT"
                rubriques={gainsBreut}
                expanded={expandedCategories.GAIN_BRUT}
                onToggleExpanded={() => toggleCategory('GAIN_BRUT')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {/* Cotisations */}
            {(selectedCategory === 'ALL' || selectedCategory === 'COTISATION') && cotisations.length > 0 && (
              <RubriqueCategory
                type="COTISATION"
                rubriques={cotisations}
                expanded={expandedCategories.COTISATION}
                onToggleExpanded={() => toggleCategory('COTISATION')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {/* Gains Non Soumis */}
            {(selectedCategory === 'ALL' || selectedCategory === 'GAIN_NON_SOUMIS') && gainsNonSoumis.length > 0 && (
              <RubriqueCategory
                type="GAIN_NON_SOUMIS"
                rubriques={gainsNonSoumis}
                expanded={expandedCategories.GAIN_NON_SOUMIS}
                onToggleExpanded={() => toggleCategory('GAIN_NON_SOUMIS')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {/* Retenues Non Soumises */}
            {(selectedCategory === 'ALL' || selectedCategory === 'RETENUE_NON_SOUMISE') && retenuesNonSoumises.length > 0 && (
              <RubriqueCategory
                type="RETENUE_NON_SOUMISE"
                rubriques={retenuesNonSoumises}
                expanded={expandedCategories.RETENUE_NON_SOUMISE}
                onToggleExpanded={() => toggleCategory('RETENUE_NON_SOUMISE')}
                onToggleRubrique={toggleRubrique}
              />
            )}

            {filteredRubriques.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune rubrique trouvée</p>
                <p className="text-sm">Essayez un autre terme de recherche</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="font-semibold text-green-600">{gainsBreut.filter(g => g.isActive).length}</span> gains du brut
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-red-600">{cotisations.filter(c => c.isActive).length}</span> cotisations
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-blue-600">{gainsNonSoumis.filter(g => g.isActive).length}</span> gains non soumis
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-orange-600">{retenuesNonSoumises.filter(r => r.isActive).length}</span> retenues non soumises
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                <span className="font-bold text-indigo-600 text-lg">{getTotalActives()}</span>/{counts.total}
              </p>
              <p className="text-xs text-gray-500">rubriques activées</p>
              <p className="text-xs text-indigo-600 mt-1">🇨🇬 Congo-Brazzaville</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  )
}