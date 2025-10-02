'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Save, X, ToggleLeft, ToggleRight } from 'lucide-react'
import { Departement } from './DepartementsManager'

interface DepartementItemProps {
  departement: Departement
  isEditing: boolean
  formData: { name: string; description: string }
  setFormData: (data: { name: string; description: string }) => void
  onEdit: (id: string) => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onCancel: () => void
  disabled: boolean
}

export function DepartementItem({
  departement,
  isEditing,
  formData,
  setFormData,
  onEdit,
  onUpdate,
  onDelete,
  onToggleActive,
  onCancel,
  disabled
}: DepartementItemProps) {
  if (isEditing) {
    return (
      <div className={`p-4 border rounded-lg ${
        departement.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
      }`}>
        <div className="space-y-3">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="font-medium"
          />
          <Input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
          />
          <div className="flex space-x-2">
            <Button
              onClick={onUpdate}
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

  return (
    <div className={`p-4 border rounded-lg ${
      departement.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className={`font-medium ${
              departement.isActive ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {departement.name}
            </h4>
            {departement.isActive ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Actif
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                Inactif
              </Badge>
            )}
          </div>
          {departement.description && (
            <p className={`text-sm mt-1 ${
              departement.isActive ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {departement.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onToggleActive(departement.id)}
            size="sm"
            variant="outline"
            className={departement.isActive ? 'text-orange-600 border-orange-600 hover:bg-orange-50' : 'text-green-600 border-green-600 hover:bg-green-50'}
            title={departement.isActive ? 'Désactiver' : 'Activer'}
          >
            {departement.isActive ? (
              <ToggleLeft className="w-4 h-4" />
            ) : (
              <ToggleRight className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => onEdit(departement.id)}
            size="sm"
            variant="outline"
            className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
            disabled={disabled}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(departement.id)}
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600"
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}