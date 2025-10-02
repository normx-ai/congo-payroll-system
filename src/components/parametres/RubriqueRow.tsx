'use client'

import { RubriqueRowEdit } from './RubriqueRowEdit'
import { RubriqueRowDisplay } from './RubriqueRowDisplay'
import type { Rubrique } from './rubriquesData'

interface RubriqueRowProps {
  rubrique: Rubrique
  isEditing: boolean
  onEdit: () => void
  onSave: (updatedRubrique: Partial<Rubrique>) => void
  onCancel: () => void
  onDelete: () => void
  onToggleActive: () => void
}

export function RubriqueRow({
  rubrique,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleActive
}: RubriqueRowProps) {
  if (isEditing) {
    return (
      <RubriqueRowEdit
        rubrique={rubrique}
        onSave={onSave}
        onCancel={onCancel}
      />
    )
  }

  return (
    <RubriqueRowDisplay
      rubrique={rubrique}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleActive={onToggleActive}
    />
  )
}