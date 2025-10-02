'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator } from 'lucide-react'

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
}

interface CalculateStepProps {
  selectedEmployeeData: Employee | undefined
  onCalculate: () => void
}

export function CalculateStep({ selectedEmployeeData, onCalculate }: CalculateStepProps) {
  return (
    <Card className="shadow-sm border-l-4 border-l-indigo-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calculator className="w-5 h-5 text-indigo-800" />
          Étape 4: Calcul de la Paie
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <p className="text-gray-600 mb-6">
          Prêt à calculer la paie pour {selectedEmployeeData?.firstName} {selectedEmployeeData?.lastName}
        </p>
        <Button
          onClick={onCalculate}
          size="lg"
          className="bg-indigo-800 hover:bg-indigo-900 text-white"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calculer la Paie
        </Button>
      </CardContent>
    </Card>
  )
}