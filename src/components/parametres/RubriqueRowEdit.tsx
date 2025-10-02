'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, X } from 'lucide-react'
import type { Rubrique } from './rubriquesData'

interface RubriqueRowEditProps {
  rubrique: Rubrique
  onSave: (updatedRubrique: Partial<Rubrique>) => void
  onCancel: () => void
}

export function RubriqueRowEdit({ rubrique, onSave, onCancel }: RubriqueRowEditProps) {
  const [editedRubrique, setEditedRubrique] = useState<Partial<Rubrique>>(rubrique)

  const handleSave = () => {
    if (editedRubrique.libelle && editedRubrique.base) {
      onSave(editedRubrique)
    }
  }

  return (
    <tr className="border-b bg-yellow-50">
      <td className="p-3">
        <span className="font-mono text-sm text-gray-600">{rubrique.code}</span>
      </td>
      <td className="p-3">
        <Input
          value={editedRubrique.libelle}
          onChange={(e) => setEditedRubrique(prev => ({ ...prev, libelle: e.target.value }))}
          className="w-full"
        />
      </td>
      <td className="p-3">
        <select
          value={editedRubrique.type}
          onChange={(e) => setEditedRubrique(prev => ({ ...prev, type: e.target.value as 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' }))}
          className="px-2 py-1 border rounded text-xs"
        >
          <option value="GAIN_BRUT">Gain Brut</option>
          <option value="GAIN_NON_SOUMIS">Gain Non Soumis</option>
          <option value="COTISATION">Cotisation</option>
          <option value="RETENUE_NON_SOUMISE">Retenue</option>
        </select>
      </td>
      <td className="p-3">
        <Input
          value={editedRubrique.base}
          onChange={(e) => setEditedRubrique(prev => ({ ...prev, base: e.target.value }))}
        />
      </td>
      <td className="p-3">
        <Input
          type="number"
          value={editedRubrique.taux || ''}
          onChange={(e) => setEditedRubrique(prev => ({ ...prev, taux: e.target.value ? parseFloat(e.target.value) : null }))}
          className="w-20"
        />
      </td>
      <td className="p-3">
        <Input
          value={editedRubrique.formule}
          onChange={(e) => setEditedRubrique(prev => ({ ...prev, formule: e.target.value }))}
          placeholder="À définir"
        />
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs ${
          rubrique.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {rubrique.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  )
}