'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, X, Save } from 'lucide-react'
import { EmployeeChargeFixe } from '@/types/employee'
import { RubriqueSelector } from './fixed-charges/RubriqueSelector'
import { ChargesList } from './fixed-charges/ChargesList'
import { ChargesSummary } from './fixed-charges/ChargesSummary'

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

interface FixedChargesModalProps {
  employeeId: string
  employeeName: string
  onClose: () => void
  onSave: (charges: EmployeeChargeFixe[]) => void
  initialCharges?: EmployeeChargeFixe[]
}

export function FixedChargesModal({
  employeeId,
  employeeName,
  onClose,
  onSave,
  initialCharges = []
}: FixedChargesModalProps) {
  const [availableRubriques, setAvailableRubriques] = useState<Rubrique[]>([])
  const [selectedRubriques, setSelectedRubriques] = useState<string[]>([])
  const [selectedCharges, setSelectedCharges] = useState<{ [rubriqueCode: string]: number }>({})
  const [showAddMenu, setShowAddMenu] = useState(false)

  const fetchRubriques = async () => {
    try {
      const response = await fetch('/api/payroll/rubriques')
      if (response.ok) {
        const data = await response.json()
        setAvailableRubriques(data.rubriques || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rubriques:', error)
    }
  }

  const loadInitialCharges = () => {
    if (initialCharges.length > 0) {
      const codes = initialCharges.map(charge => charge.rubriqueCode)
      const amounts = initialCharges.reduce((acc, charge) => {
        acc[charge.rubriqueCode] = charge.amount
        return acc
      }, {} as { [key: string]: number })

      setSelectedRubriques(codes)
      setSelectedCharges(amounts)
    }
  }

  useEffect(() => {
    fetchRubriques()
    loadInitialCharges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddRubrique = (rubriqueCode: string) => {
    if (!selectedRubriques.includes(rubriqueCode)) {
      setSelectedRubriques(prev => [...prev, rubriqueCode])
      setSelectedCharges(prev => ({ ...prev, [rubriqueCode]: 0 }))
    }
    setShowAddMenu(false)
  }

  const handleRemoveRubrique = (rubriqueCode: string) => {
    setSelectedRubriques(prev => prev.filter(code => code !== rubriqueCode))
    setSelectedCharges(prev => {
      const newCharges = { ...prev }
      delete newCharges[rubriqueCode]
      return newCharges
    })
  }

  const handleAmountChange = (rubriqueCode: string, value: string) => {
    const numericValue = parseFloat(value) || 0
    setSelectedCharges(prev => ({
      ...prev,
      [rubriqueCode]: numericValue
    }))
  }

  const handleSave = () => {
    const charges: EmployeeChargeFixe[] = Object.entries(selectedCharges)
      .filter(([, amount]) => amount > 0)
      .map(([rubriqueCode, amount]) => ({
        id: `temp-${Date.now()}-${rubriqueCode}`,
        employeeId,
        rubriqueCode,
        amount,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

    onSave(charges)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Charges fixes - {employeeName}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <RubriqueSelector
              availableRubriques={availableRubriques}
              selectedRubriques={selectedRubriques}
              onAddRubrique={handleAddRubrique}
              showAddMenu={showAddMenu}
              onToggleAddMenu={() => setShowAddMenu(!showAddMenu)}
            />

            <ChargesList
              selectedRubriques={selectedRubriques}
              selectedCharges={selectedCharges}
              availableRubriques={availableRubriques}
              onRemoveRubrique={handleRemoveRubrique}
              onAmountChange={handleAmountChange}
            />

            <ChargesSummary
              selectedCharges={selectedCharges}
              availableRubriques={availableRubriques}
            />
          </div>
        </CardContent>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Enregistrer
          </Button>
        </div>
      </Card>
    </div>
  )
}