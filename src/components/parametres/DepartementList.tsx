'use client'

import React from 'react'
import { DepartementItem } from './DepartementItem'
import { Departement } from './DepartementsManager'

interface DepartementListProps {
  departements: Departement[]
  editingId: string | null
  formData: { name: string; description: string }
  setFormData: (data: { name: string; description: string }) => void
  onEdit: (id: string) => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onToggleActive: (id: string) => void
  onCancel: () => void
  isAdding: boolean
}

export function DepartementList({
  departements,
  editingId,
  formData,
  setFormData,
  onEdit,
  onUpdate,
  onDelete,
  onToggleActive,
  onCancel,
  isAdding
}: DepartementListProps) {
  return (
    <div className="space-y-2">
      {departements.map((dept) => (
        <DepartementItem
          key={dept.id}
          departement={dept}
          isEditing={editingId === dept.id}
          formData={formData}
          setFormData={setFormData}
          onEdit={onEdit}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onCancel={onCancel}
          disabled={editingId !== null || isAdding}
        />
      ))}
    </div>
  )
}