'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, ChevronLeft } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'
import { RubriqueAmount, Employee, getRubriqueTypeColor, getRubriqueTypeLabel } from '../utils/rubrique-utils'


interface AmountsStepProps {
  selectedEmployee: string
  selectedEmployeeData: Employee | undefined
  amounts: RubriqueAmount[]
  onUpdateAmount: (rubriqueCode: string, amount: number) => void
  onNext: () => void
  onBack?: () => void
}


export function AmountsStep({ selectedEmployee, selectedEmployeeData, amounts, onUpdateAmount, onNext, onBack }: AmountsStepProps) {
  const { rubriques } = useRubriques()

  // Ne considérer que les rubriques cochées par l'utilisateur (isActive = true)
  const selectedRubriques = rubriques.filter(r => r.isActive)

  // Récupérer les codes des rubriques déjà configurées dans les charges fixes
  const configuredRubriquesCodes = selectedEmployeeData?.chargesFixes
    ?.filter(cf => cf.isActive && cf.amount > 0)
    ?.map(cf => cf.rubriqueCode) || []


  // Séparer les rubriques par catégorie
  const configuredRubriques = selectedRubriques.filter(r =>
    configuredRubriquesCodes.includes(r.code)
  )

  const manualEntryRubriques = selectedRubriques.filter(r =>
    r.formule === '' &&
    !configuredRubriquesCodes.includes(r.code)
  )

  const calculatedRubriques = selectedRubriques.filter(r =>
    r.formule !== '' &&
    !configuredRubriquesCodes.includes(r.code)
  )


  // Intégrer automatiquement les charges fixes dans les montants, mais seulement pour les rubriques sélectionnées
  useEffect(() => {
    if (selectedEmployeeData?.chargesFixes && selectedRubriques.length > 0) {
      const selectedCodes = selectedRubriques.map(r => r.code)

      selectedEmployeeData.chargesFixes.forEach(chargeFixe => {
        if (chargeFixe.isActive &&
            chargeFixe.amount > 0 &&
            selectedCodes.includes(chargeFixe.rubriqueCode)) {

          // Vérifier si ce montant n'existe pas déjà
          const existingAmount = amounts.find(a =>
            a.employeeId === selectedEmployee &&
            a.rubriqueCode === chargeFixe.rubriqueCode
          )

          if (!existingAmount) {
            onUpdateAmount(chargeFixe.rubriqueCode, chargeFixe.amount)
          }
        }
      })
    }
  }, [selectedEmployeeData, selectedEmployee, selectedRubriques, amounts, onUpdateAmount])

  const getAmountForRubrique = (rubriqueCode: string): number => {
    const amount = amounts.find(a => a.employeeId === selectedEmployee && a.rubriqueCode === rubriqueCode)
    return amount ? amount.amount : 0
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-700">
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
              <CreditCard className="w-5 h-5 text-indigo-700" />
              Étape 3: Montants ({configuredRubriques.length} configurées, {manualEntryRubriques.length} à saisir, {calculatedRubriques.length} calculées)
            </CardTitle>
          </div>
          <Button
            onClick={onNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 h-auto text-sm"
          >
            Suivant: Calculer la paie
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Section des rubriques configurées */}
          {configuredRubriques.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Montants configurés automatiquement
              </h3>
              <div className="space-y-2">
                {configuredRubriques.map(rubrique => {
                  const chargeFixe = selectedEmployeeData?.chargesFixes?.find(
                    cf => cf.rubriqueCode === rubrique.code && cf.isActive
                  )
                  return (
                    <div key={rubrique.code} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                            {getRubriqueTypeLabel(rubrique.type)}
                          </span>
                          <span className="text-sm font-medium">{rubrique.libelle}</span>
                          <span className="text-xs text-gray-500">({rubrique.code})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-28 text-right text-sm font-medium text-green-700">
                          {chargeFixe ? new Intl.NumberFormat('fr-FR').format(chargeFixe.amount) : '0'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Section des rubriques à saisir manuellement */}
          {manualEntryRubriques.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Montants à saisir manuellement
              </h3>
              <div className="space-y-3">
                {manualEntryRubriques.map(rubrique => (
                  <div key={rubrique.code} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                          {getRubriqueTypeLabel(rubrique.type)}
                        </span>
                        <span className="text-sm font-medium">{rubrique.libelle}</span>
                        <span className="text-xs text-gray-500">({rubrique.code})</span>
                      </div>
                    </div>
                    <div className="w-28">
                      <Input
                        type="number"
                        placeholder="Montant"
                        value={getAmountForRubrique(rubrique.code) || ''}
                        onChange={(e) => onUpdateAmount(rubrique.code, Number(e.target.value))}
                        className="text-right text-sm h-8"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section des rubriques calculées automatiquement */}
          {calculatedRubriques.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                Montants calculés automatiquement
              </h3>
              <div className="space-y-2">
                {calculatedRubriques.map(rubrique => (
                  <div key={rubrique.code} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRubriqueTypeColor(rubrique.type)}`}>
                          {getRubriqueTypeLabel(rubrique.type)}
                        </span>
                        <span className="text-sm font-medium">{rubrique.libelle}</span>
                        <span className="text-xs text-gray-500">({rubrique.code})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-28 text-right text-sm font-medium text-gray-600">
                        Calculé auto
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}