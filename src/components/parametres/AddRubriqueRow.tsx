'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, X } from 'lucide-react'
import type { Rubrique } from './rubriquesData'

interface AddRubriqueRowProps {
  onSave: (rubrique: Rubrique) => void
  onCancel: () => void
}

export function AddRubriqueRow({ onSave, onCancel }: AddRubriqueRowProps) {
  const [newRubrique, setNewRubrique] = useState<Partial<Rubrique>>({
    code: '',
    libelle: '',
    type: 'GAIN_BRUT',
    base: '',
    taux: null,
    formule: '',
    imposable: true,
    isActive: true
  })

  const handleSave = () => {
    if (newRubrique.code && newRubrique.libelle && newRubrique.base) {
      const rubrique: Rubrique = {
        code: newRubrique.code,
        libelle: newRubrique.libelle,
        type: newRubrique.type || 'GAIN_BRUT',
        base: newRubrique.base,
        taux: newRubrique.taux || null,
        formule: newRubrique.formule || '',
        imposable: newRubrique.imposable || true,
        isActive: true
      }
      onSave(rubrique)
    }
  }

  return (
    <tr className="border-b bg-blue-50">
      <td className="p-3">
        <Input
          value={newRubrique.code}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, code: e.target.value }))}
          placeholder="Ex: 006"
          className="w-20"
        />
      </td>
      <td className="p-3">
        <Input
          value={newRubrique.libelle}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, libelle: e.target.value }))}
          placeholder="Nom de la rubrique"
        />
      </td>
      <td className="p-3">
        <select
          value={newRubrique.type}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, type: e.target.value as 'GAIN_BRUT' | 'COTISATION' | 'GAIN_NON_SOUMIS' | 'RETENUE_NON_SOUMISE' }))}
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
          value={newRubrique.base}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, base: e.target.value }))}
          placeholder="Ex: Salaire brut"
        />
      </td>
      <td className="p-3">
        <Input
          type="number"
          value={newRubrique.taux || ''}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, taux: e.target.value ? parseFloat(e.target.value) : null }))}
          placeholder="0.00"
          className="w-20"
        />
      </td>
      <td className="p-3">
        <Input
          value={newRubrique.formule}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, formule: e.target.value }))}
          placeholder="À définir"
        />
      </td>
      <td className="p-3">
        <select
          value={newRubrique.imposable ? 'true' : 'false'}
          onChange={(e) => setNewRubrique(prev => ({ ...prev, imposable: e.target.value === 'true' }))}
          className="px-2 py-1 border rounded text-xs"
        >
          <option value="true">Imposable</option>
          <option value="false">Non imposable</option>
        </select>
      </td>
      <td className="p-3">
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          Active
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