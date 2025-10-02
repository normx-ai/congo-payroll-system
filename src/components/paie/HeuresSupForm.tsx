'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { HeuresSupInput } from './HeuresSupInput'
import type { HeuresSupDetails } from '@/lib/convention-collective'

interface HeuresSupFormProps {
  employeeId: string
  employeeName: string
  onSave: (heures: HeuresSupDetails) => void
}

const heuresConfig = [
  { field: 'jourPremieresHeures', label: 'Jour - 5 premières heures', majoration: '+10%', color: 'text-green-600', max: 5 },
  { field: 'jourSuivantes', label: 'Jour - heures suivantes', majoration: '+25%', color: 'text-blue-600' },
  { field: 'nuitOuvrable', label: 'Nuit jours ouvrables', majoration: '+50%', color: 'text-orange-600' },
  { field: 'jourRepos', label: 'Jour repos/férié', majoration: '+50%', color: 'text-orange-600' },
  { field: 'nuitRepos', label: 'Nuit repos/férié', majoration: '+100%', color: 'text-red-600' }
]

export function HeuresSupForm({ employeeName, onSave }: HeuresSupFormProps) {
  const [heures, setHeures] = useState<HeuresSupDetails>({
    jourPremieresHeures: 0,
    jourSuivantes: 0,
    nuitOuvrable: 0,
    jourRepos: 0,
    nuitRepos: 0
  })

  const handleChange = (field: keyof HeuresSupDetails, value: string) => {
    const numValue = parseFloat(value) || 0
    setHeures(prev => ({ ...prev, [field]: numValue }))
  }

  const totalHeures = Object.values(heures).reduce((sum, h) => sum + (h || 0), 0)

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Clock className="w-5 h-5 text-purple-600" />
          Heures Supplémentaires - {employeeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {heuresConfig.map((config) => (
            <HeuresSupInput
              key={config.field}
              label={config.label}
              majorationLabel={config.majoration}
              majorationColor={config.color}
              value={heures[config.field as keyof HeuresSupDetails]}
              onChange={(value) => handleChange(config.field as keyof HeuresSupDetails, value)}
              max={config.max}
            />
          ))}

          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Total heures sup</div>
            <div className="text-xl font-bold text-indigo-900">{totalHeures}h</div>
          </div>
        </div>

        <button
          onClick={() => onSave(heures)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md"
        >
          Enregistrer les heures
        </button>
      </CardContent>
    </Card>
  )
}