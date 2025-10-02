'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Save } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useRubriques } from '@/contexts/RubriquesContext'
import { EmployeeSelector } from './rubrique-amount/EmployeeSelector'
import { ManualRubriques } from './rubrique-amount/ManualRubriques'
import { CalculatedRubriques } from './rubrique-amount/CalculatedRubriques'
import {
  Employee,
  RubriqueAmount,
  formatAmount,
  calculateRubriqueValue,
  initializeAmountsFromData
} from './rubrique-amount/rubrique-utils'

interface RubriqueAmountEntryProps {
  selectedEmployee: string
  employees: Employee[]
  amounts: RubriqueAmount[]
  onEmployeeChange: (employeeId: string) => void
}

export function RubriqueAmountEntry({
  selectedEmployee,
  employees,
  amounts,
  onEmployeeChange
}: RubriqueAmountEntryProps) {
  const { showToast } = useToast()
  const { rubriques } = useRubriques()

  const [localAmounts, setLocalAmounts] = useState<{ [key: string]: number }>({})

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee)

  const initializeLocalAmounts = () => {
    const initialized = initializeAmountsFromData(amounts, selectedEmployee)
    setLocalAmounts(initialized)
  }

  useEffect(() => {
    if (selectedEmployee) {
      initializeLocalAmounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, amounts])

  const updateAmount = (rubriqueCode: string, amount: number) => {
    setLocalAmounts(prev => ({
      ...prev,
      [rubriqueCode]: amount
    }))
  }

  const handleAmountChange = (rubriqueCode: string, value: string) => {
    const numericValue = parseFloat(value) || 0
    updateAmount(rubriqueCode, numericValue)
  }

  const calculateRubrique = (rubrique: { code: string; formule: string }): number => {
    const salaireBase = selectedEmployeeData?.salaireBase || 150000
    // Convertir en objet Rubrique complet pour la fonction utilitaire
    const fullRubrique = {
      ...rubrique,
      libelle: '',
      type: 'GAIN_BRUT' as const,
      isActive: true
    }
    return calculateRubriqueValue(fullRubrique, salaireBase)
  }

  const saveAmounts = async () => {
    try {
      console.log('Sauvegarde des montants par rubrique:', amounts)
      showToast(`${amounts.length} montant(s) sauvegardé(s) avec succès`, 'success')
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error')
    }
  }

  if (!selectedEmployee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saisie des montants par rubrique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeSelector
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeChange={onEmployeeChange}
          />
          <div className="text-center py-8 text-gray-500">
            <p>Veuillez sélectionner un employé pour commencer la saisie</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Saisie des montants par rubrique
          </CardTitle>
          <Button onClick={saveAmounts} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <EmployeeSelector
          employees={employees}
          selectedEmployee={selectedEmployee}
          onEmployeeChange={onEmployeeChange}
        />

        {selectedEmployeeData && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Informations employé sélectionné</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom complet :</span>
                <p className="font-medium">
                  {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Poste :</span>
                <p className="font-medium">{selectedEmployeeData.position}</p>
              </div>
              <div>
                <span className="text-gray-600">Code employé :</span>
                <p className="font-medium">{selectedEmployeeData.employeeCode}</p>
              </div>
              <div>
                <span className="text-gray-600">Salaire de base :</span>
                <p className="font-medium">
                  {formatAmount(selectedEmployeeData.salaireBase || 150000)}
                </p>
              </div>
            </div>
          </div>
        )}

        <ManualRubriques
          rubriques={rubriques}
          localAmounts={localAmounts}
          onAmountChange={handleAmountChange}
        />

        <CalculatedRubriques
          rubriques={rubriques}
          selectedEmployee={selectedEmployeeData}
          calculateRubriqueValue={calculateRubrique}
          formatAmount={formatAmount}
        />
      </CardContent>
    </Card>
  )
}