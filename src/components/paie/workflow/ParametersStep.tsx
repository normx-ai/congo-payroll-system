'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, ChevronLeft } from 'lucide-react'
import { useRubriques } from '@/contexts/RubriquesContext'

interface PayrollParameter {
  employeeId: string
  parameter: string
  value: number
}

interface ParametersStepProps {
  selectedEmployee: string
  parameters: PayrollParameter[]
  onUpdateParameter: (parameter: string, value: number) => void
  onNext: () => void
  onBack?: () => void
}

export function ParametersStep({ selectedEmployee, parameters, onUpdateParameter, onNext, onBack }: ParametersStepProps) {
  const { rubriques } = useRubriques()

  const activeRubriquesWithParameters = rubriques.filter(r =>
    r.isActive && r.formule?.includes('joursTravailles')
  )


  const getParameterValue = (parameter: string): number => {
    const param = parameters.find(p => p.employeeId === selectedEmployee && p.parameter === parameter)
    return param ? param.value : 0
  }

  const needsJoursTravailles = activeRubriquesWithParameters.some(r => r.formule?.includes('joursTravailles'))

  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-500">
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
              <Calendar className="w-5 h-5 text-indigo-500" />
              Paramètres de Paie
            </CardTitle>
          </div>
          <Button
            onClick={onNext}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 h-auto text-sm"
          >
            Suivant: Saisie des montants
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsJoursTravailles && (
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <span className="font-medium">Nombre de jours travaillés</span>
              <p className="text-sm text-gray-600">Base de calcul pour les salaires</p>
            </div>
            <div className="w-32">
              <Input
                type="number"
                placeholder="26"
                min="1"
                max="31"
                value={getParameterValue('joursTravailles') || ''}
                onChange={(e) => onUpdateParameter('joursTravailles', Number(e.target.value))}
                className="text-right"
              />
            </div>
            <div className="w-12 text-sm text-gray-500">
              jours
            </div>
          </div>
        )}

        {activeRubriquesWithParameters.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Rubriques concernées :</p>
            <ul className="text-sm text-blue-700 mt-1">
              {activeRubriquesWithParameters.map(r => (
                <li key={r.code}>• {r.libelle} ({r.code})</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}