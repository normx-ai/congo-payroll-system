'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Save, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useRubriques } from '@/contexts/RubriquesContext'
import { ChargesList } from './fixed-charges/ChargesList'
import { RubriqueSelector } from './fixed-charges/RubriqueSelector'

interface EmployeeChargeFixe {
  id: string
  employeeId: string
  rubriqueCode: string
  amount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}


interface EmployeeChargesFixesModalProps {
  isOpen: boolean
  onClose: () => void
  employeeId: string
  employeeName: string
}

export function EmployeeChargesFixesModal({
  isOpen,
  onClose,
  employeeId,
  employeeName
}: EmployeeChargesFixesModalProps) {
  const { showToast } = useToast()
  const { rubriques } = useRubriques()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRubriqueSelector, setShowRubriqueSelector] = useState(false)

  // État des charges fixes
  const [selectedRubriques, setSelectedRubriques] = useState<string[]>([])
  const [selectedCharges, setSelectedCharges] = useState<{ [rubriqueCode: string]: number }>({})

  // Toutes les rubriques disponibles (actives et inactives)
  const availableRubriques = rubriques

  // Charger les charges fixes existantes
  const loadChargesFixes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/employees/${employeeId}/charges-fixes`)
      if (response.ok) {
        const data = await response.json()

        // Populer les états locaux
        const rubriques = data.map((cf: EmployeeChargeFixe) => cf.rubriqueCode)
        const charges = data.reduce((acc: { [rubriqueCode: string]: number }, cf: EmployeeChargeFixe) => {
          acc[cf.rubriqueCode] = cf.amount
          return acc
        }, {})

        setSelectedRubriques(rubriques)
        setSelectedCharges(charges)
      }
    } catch (error) {
      console.error('Erreur chargement charges fixes:', error)
      showToast('Erreur lors du chargement des charges fixes', 'error')
    } finally {
      setLoading(false)
    }
  }, [employeeId, showToast])

  useEffect(() => {
    if (isOpen && employeeId) {
      loadChargesFixes()
    }
  }, [isOpen, employeeId, loadChargesFixes])

  const handleAddRubrique = (rubriqueCode: string) => {
    if (!selectedRubriques.includes(rubriqueCode)) {
      setSelectedRubriques([...selectedRubriques, rubriqueCode])
      setSelectedCharges({ ...selectedCharges, [rubriqueCode]: 0 })
    }
  }

  const handleRemoveRubrique = (rubriqueCode: string) => {
    setSelectedRubriques(selectedRubriques.filter(code => code !== rubriqueCode))
    const newCharges = { ...selectedCharges }
    delete newCharges[rubriqueCode]
    setSelectedCharges(newCharges)
  }

  const handleAmountChange = (rubriqueCode: string, value: string) => {
    const amount = parseFloat(value) || 0
    setSelectedCharges({ ...selectedCharges, [rubriqueCode]: amount })
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Sauvegarder chaque charge fixe
      const promises = selectedRubriques.map(async (rubriqueCode) => {
        const amount = selectedCharges[rubriqueCode] || 0

        const response = await fetch(`/api/employees/${employeeId}/charges-fixes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rubriqueCode,
            amount,
            isActive: amount > 0
          })
        })

        if (!response.ok) {
          throw new Error(`Erreur sauvegarde ${rubriqueCode}`)
        }

        return response.json()
      })

      await Promise.all(promises)
      showToast('Charges fixes sauvegardées avec succès', 'success')
      onClose()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      showToast('Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-indigo-900">
              Charges fixes - {employeeName}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Configurez les charges fixes qui seront automatiquement appliquées lors du traitement de la paie.
            </p>
            <Button
              onClick={() => setShowRubriqueSelector(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une rubrique
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chargement des charges fixes...</p>
            </div>
          ) : (
            <ChargesList
              selectedRubriques={selectedRubriques}
              selectedCharges={selectedCharges}
              availableRubriques={availableRubriques}
              onRemoveRubrique={handleRemoveRubrique}
              onAmountChange={handleAmountChange}
            />
          )}

          {showRubriqueSelector && (
            <RubriqueSelector
              availableRubriques={availableRubriques}
              selectedRubriques={selectedRubriques}
              onAddRubrique={handleAddRubrique}
              showAddMenu={true}
              onToggleAddMenu={() => setShowRubriqueSelector(false)}
            />
          )}

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? (
                <>Sauvegarde...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}