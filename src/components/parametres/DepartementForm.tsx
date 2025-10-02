'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Save, X } from 'lucide-react'

interface DepartementFormProps {
  isAdding: boolean
  setIsAdding: (value: boolean) => void
  formData: { name: string; description: string }
  setFormData: (data: { name: string; description: string }) => void
  onAdd: () => void
  onCancel: () => void
  disabled: boolean
}

export function DepartementForm({
  isAdding,
  setIsAdding,
  formData,
  setFormData,
  onAdd,
  onCancel,
  disabled
}: DepartementFormProps) {
  if (!isAdding) {
    return (
      <Button
        onClick={() => setIsAdding(true)}
        size="sm"
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={disabled}
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter
      </Button>
    )
  }

  return (
    <div className="w-full p-4 border border-indigo-200 rounded-lg bg-indigo-50">
      <h3 className="font-medium text-indigo-900 mb-3">Nouveau département</h3>
      <div className="space-y-3">
        <Input
          placeholder="Nom du département *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-white"
        />
        <Input
          placeholder="Description (optionnelle)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-white"
        />
        <div className="flex space-x-2">
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!formData.name.trim()}
          >
            <Save className="w-4 h-4 mr-1" />
            Enregistrer
          </Button>
          <Button
            onClick={onCancel}
            size="sm"
            variant="outline"
            className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            <X className="w-4 h-4 mr-1" />
            Annuler
          </Button>
        </div>
      </div>
    </div>
  )
}