'use client'

import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import type { Rubrique } from './rubriquesData'

interface RubriqueRowDisplayProps {
  rubrique: Rubrique
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

export function RubriqueRowDisplay({ rubrique, onEdit, onDelete, onToggleActive }: RubriqueRowDisplayProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">
        <span className="font-mono text-sm text-gray-900">{rubrique.code}</span>
      </td>
      <td className="p-3 text-sm text-gray-900">{rubrique.libelle}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          rubrique.type === 'GAIN_BRUT'
            ? 'bg-green-100 text-green-800'
            : rubrique.type === 'GAIN_NON_SOUMIS'
            ? 'bg-indigo-100 text-indigo-800'
            : rubrique.type === 'COTISATION'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {rubrique.type === 'GAIN_BRUT' ? 'Imposable' :
           rubrique.type === 'GAIN_NON_SOUMIS' ? 'Non imposable' :
           rubrique.type === 'COTISATION' ? 'Cotisation' : 'Retenue'}
        </span>
      </td>
      <td className="p-3 text-sm text-gray-700">{rubrique.base}</td>
      <td className="p-3 text-sm text-gray-700">{rubrique.taux ? `${rubrique.taux}%` : '-'}</td>
      <td className="p-3 text-sm text-gray-500 italic">
        {rubrique.formule || 'À définir'}
      </td>
      <td className="p-3">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={rubrique.isActive}
              onChange={onToggleActive}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${
              rubrique.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                rubrique.isActive ? 'translate-x-5' : 'translate-x-1'
              } mt-1`}></div>
            </div>
          </div>
          <span className={`ml-2 text-xs ${
            rubrique.isActive ? 'text-green-800' : 'text-gray-600'
          }`}>
            {rubrique.isActive ? 'Active' : 'Inactive'}
          </span>
        </label>
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  )
}