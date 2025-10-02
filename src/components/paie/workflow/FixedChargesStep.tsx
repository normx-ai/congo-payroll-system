'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Save } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'
import { EmployeeChargeFixe } from '@/types/employee'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  chargesFixes?: EmployeeChargeFixe[]
}

interface FixedChargesStepProps {
  selectedEmployeeData: Employee | undefined
  onNext: () => void
}

export function FixedChargesStep({ selectedEmployeeData, onNext }: FixedChargesStepProps) {
  const { rubriques } = useRubriques()
  const [fixedCharges, setFixedCharges] = useState<EmployeeChargeFixe[]>([])
  const [editingCharges, setEditingCharges] = useState<{[key: string]: number}>({})

  const retenueFixes = rubriques.filter(r =>
    r.type === 'RETENUE_NON_SOUMISE' && r.formule === '' &&
    ['503', '500', '501', '502'].includes(r.code)
  )

  useEffect(() => {
    if (selectedEmployeeData?.chargesFixes) {
      setFixedCharges(selectedEmployeeData.chargesFixes)
    }
  }, [selectedEmployeeData])

  const getFixedChargeAmount = (rubriqueCode: string): number => {
    const charge = fixedCharges.find(c => c.rubriqueCode === rubriqueCode && c.isActive)
    return charge ? charge.amount : 0
  }

  const updateFixedCharge = (rubriqueCode: string, amount: number) => {
    setFixedCharges(prev => {
      const existing = prev.find(c => c.rubriqueCode === rubriqueCode)

      if (existing) {
        return prev.map(c =>
          c.rubriqueCode === rubriqueCode
            ? { ...c, amount, isActive: amount > 0 }
            : c
        )
      } else if (amount > 0) {
        return [...prev, {
          id: `temp-${Date.now()}`,
          employeeId: selectedEmployeeData?.id || '',
          rubriqueCode,
          amount,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }

      return prev
    })
  }

  const saveFixedCharges = async () => {
    // Ici on sauvegarderait les charges fixes en base
    console.log('Sauvegarde des charges fixes:', fixedCharges)
    onNext()
  }

  const getRubriqueLabel = (code: string): string => {
    switch (code) {
      case '503': return 'Retenue pharmacie'
      case '500': return 'Avance sur salaire'
      case '501': return 'Prêt entreprise'
      case '502': return 'Retenue syndicale'
      default: return code
    }
  }

  const activeCharges = fixedCharges.filter(c => c.isActive && c.amount > 0)

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-600">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Settings className="w-5 h-5 text-indigo-600" />
          Charges Fixes - {selectedEmployeeData?.firstName} {selectedEmployeeData?.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration des charges fixes */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Retenues fixes mensuelles
          </h3>
          <div className="space-y-3">
            {retenueFixes.map(rubrique => (
              <div key={rubrique.code} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{getRubriqueLabel(rubrique.code)}</span>
                  <p className="text-sm text-gray-600">Montant fixe déduit chaque mois</p>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={editingCharges[rubrique.code] ?? (getFixedChargeAmount(rubrique.code) || '')}
                    onChange={(e) => setEditingCharges(prev => ({
                      ...prev,
                      [rubrique.code]: Number(e.target.value)
                    }))}
                    onBlur={() => {
                      const amount = editingCharges[rubrique.code] || 0
                      updateFixedCharge(rubrique.code, amount)
                      setEditingCharges(prev => {
                        const newCharges = { ...prev }
                        delete newCharges[rubrique.code]
                        return newCharges
                      })
                    }}
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

        {/* Résumé des charges actives */}
        {activeCharges.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Charges fixes configurées :</h4>
            <div className="space-y-1">
              {activeCharges.map(charge => (
                <div key={charge.rubriqueCode} className="flex justify-between text-sm">
                  <span className="text-blue-800">
                    {getRubriqueLabel(charge.rubriqueCode)}
                  </span>
                  <span className="font-medium text-blue-900">
                    {new Intl.NumberFormat('fr-FR').format(charge.amount)} FCFA
                  </span>
                </div>
              ))}
              <div className="border-t border-blue-200 pt-1 mt-2">
                <div className="flex justify-between font-medium text-blue-900">
                  <span>Total mensuel :</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR').format(
                      activeCharges.reduce((sum, c) => sum + c.amount, 0)
                    )} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={saveFixedCharges}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder et Continuer
          </Button>
          <Button
            onClick={onNext}
            variant="outline"
            className="border-gray-300"
          >
            Ignorer cette étape
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}