'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Settings } from 'lucide-react'

interface PayrollConstant {
  id: string
  name: string
  description: string
  value: number
  unit: '%' | 'FCFA' | 'days' | 'heures'
  category: 'social' | 'tax' | 'legal' | 'overtime'
}

interface ConstantCardProps {
  category: 'social' | 'tax' | 'legal' | 'overtime'
  constants: PayrollConstant[]
  onValueChange: (id: string, value: number) => void
}

const getCategoryColor = (category: PayrollConstant['category']) => {
  switch (category) {
    case 'social': return 'bg-blue-50 border-blue-200'
    case 'tax': return 'bg-orange-50 border-orange-200'
    case 'legal': return 'bg-green-50 border-green-200'
    case 'overtime': return 'bg-purple-50 border-purple-200'
  }
}

const formatNumber = (value: number, unit: string) => {
  if (unit === 'FCFA') {
    return value.toLocaleString('fr-FR')
  }
  return value.toString()
}

export function ConstantCard({ category, constants, onValueChange }: ConstantCardProps) {
  const getCategoryTitle = (category: PayrollConstant['category']) => {
    switch (category) {
      case 'social': return 'Cotisations Sociales'
      case 'tax': return 'Taxes et Impôts'
      case 'legal': return 'Constantes Légales'
      case 'overtime': return 'Heures Supplémentaires'
    }
  }

  return (
    <Card className={`shadow-sm border-l-4 ${getCategoryColor(category)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
          <Settings className="w-4 h-4" />
          {getCategoryTitle(category)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {constants.map((constant) => (
            <div key={constant.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-gray-900 text-sm">{constant.name}</h3>
                <p className="text-xs text-gray-500 leading-4">{constant.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={formatNumber(constant.value, constant.unit)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9.]/g, '')
                    onValueChange(constant.id, parseFloat(value) || 0)
                  }}
                  className="w-28 text-right text-sm h-8"
                />
                <span className="text-xs font-medium text-gray-700 w-10 text-center">
                  {constant.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}