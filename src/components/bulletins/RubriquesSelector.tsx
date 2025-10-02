'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Coins, Plus, Minus, Calculator } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'
import { getRubriqueTypeColor, getRubriqueTypeLabel } from '@/components/paie/utils/rubrique-utils'

interface RubriqueSaisie {
  code: string
  montant: number
  nbHeures?: number
}

interface RubriquesSelectorProps {
  selectedEmployee: string
  onRubriquesChange: (rubriquesSaisies: RubriqueSaisie[]) => void
}

export function RubriquesSelector({ selectedEmployee, onRubriquesChange }: RubriquesSelectorProps) {
  const { rubriques } = useRubriques()
  const [rubriquesSaisies, setRubriquesSaisies] = useState<RubriqueSaisie[]>([])

  useEffect(() => {
    onRubriquesChange(rubriquesSaisies)
  }, [rubriquesSaisies, onRubriquesChange])

  const toggleRubrique = (code: string) => {
    setRubriquesSaisies(prev => {
      const exists = prev.find(r => r.code === code)
      if (exists) {
        // Retirer la rubrique
        return prev.filter(r => r.code !== code)
      } else {
        // Ajouter la rubrique avec montant par défaut
        return [...prev, {
          code,
          montant: 0,
          nbHeures: ['016', '017'].includes(code) ? 0 : undefined // Heures sup 10% et 25%
        }]
      }
    })
  }

  const updateMontant = (code: string, montant: number) => {
    setRubriquesSaisies(prev =>
      prev.map(r => r.code === code ? { ...r, montant } : r)
    )
  }

  const updateHeures = (code: string, nbHeures: number) => {
    setRubriquesSaisies(prev =>
      prev.map(r => r.code === code ? { ...r, nbHeures } : r)
    )
  }

  const isSelected = (code: string) => rubriquesSaisies.some(r => r.code === code)
  const getMontant = (code: string) => rubriquesSaisies.find(r => r.code === code)?.montant || 0
  const getHeures = (code: string) => rubriquesSaisies.find(r => r.code === code)?.nbHeures || 0

  // Catégoriser les rubriques selon les nouveaux types
  const gains = rubriques.filter(r =>
    r.type === 'GAIN_BRUT' || r.type === 'GAIN_NON_SOUMIS'
  )
  const retenues = rubriques.filter(r =>
    r.type === 'COTISATION' || r.type === 'RETENUE_NON_SOUMISE'
  )

  // Déterminer si une rubrique est variable (a une formule vide = saisie manuelle)
  const isVariable = (rubrique: typeof rubriques[0]) => rubrique.formule === ''

  if (!selectedEmployee) {
    return (
      <Card className="border-l-4 border-l-yellow-500 shadow-lg opacity-50">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Coins className="w-5 h-5" />
            Rubriques de Paie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Sélectionnez d&apos;abord un employé
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-yellow-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <Coins className="w-5 h-5 text-yellow-600" />
          Rubriques de Paie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Gains
              </h3>
              <div className="space-y-2">
                {gains.map(rubrique => (
                  <div key={rubrique.code} className="p-2 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        checked={isSelected(rubrique.code)}
                        onCheckedChange={() => toggleRubrique(rubrique.code)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                          {getRubriqueTypeLabel(rubrique.type)}
                        </span>
                        <span className="text-sm">{rubrique.libelle}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-1 rounded">{rubrique.code}</span>
                      {isVariable(rubrique) && (
                        <div title="Variable - Saisie manuelle">
                          <Calculator className="w-3 h-3 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {isSelected(rubrique.code) && (
                      <div className="ml-6 flex items-center gap-2">
                        {['016', '017'].includes(rubrique.code) && ( // Heures supplémentaires
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              placeholder="Heures"
                              value={getHeures(rubrique.code) || ''}
                              onChange={(e) => updateHeures(rubrique.code, Number(e.target.value))}
                              className="w-16 h-7 text-xs"
                              min="0"
                              step="0.5"
                            />
                            <span className="text-xs text-gray-500">h ×</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder="Montant"
                            value={getMontant(rubrique.code) || ''}
                            onChange={(e) => updateMontant(rubrique.code, Number(e.target.value))}
                            className="w-24 h-7 text-xs"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">FCFA</span>
                        </div>
                        {!isVariable(rubrique) && (
                          <span className="text-xs text-gray-400">(Calculé auto)</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <Minus className="w-4 h-4" /> Retenues
              </h3>
              <div className="space-y-2">
                {retenues.map(rubrique => (
                  <div key={rubrique.code} className="p-2 border rounded-lg bg-red-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        checked={isSelected(rubrique.code)}
                        onCheckedChange={() => toggleRubrique(rubrique.code)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                          {getRubriqueTypeLabel(rubrique.type)}
                        </span>
                        <span className="text-sm">{rubrique.libelle}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-1 rounded">{rubrique.code}</span>
                      {isVariable(rubrique) && (
                        <div title="Variable - Saisie manuelle">
                          <Calculator className="w-3 h-3 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {isSelected(rubrique.code) && isVariable(rubrique) && (
                      <div className="ml-6 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder="Montant"
                            value={getMontant(rubrique.code) || ''}
                            onChange={(e) => updateMontant(rubrique.code, Number(e.target.value))}
                            className="w-24 h-7 text-xs"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">FCFA</span>
                        </div>
                      </div>
                    )}

                    {isSelected(rubrique.code) && !isVariable(rubrique) && (
                      <div className="ml-6 text-xs text-gray-500">
                        Montant calculé automatiquement selon la formule: {rubrique.formule}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{rubriquesSaisies.length}</span> rubriques avec montants saisis
          </p>
        </div>
      </CardContent>
    </Card>
  )
}