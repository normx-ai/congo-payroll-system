'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { DepartementForm } from './DepartementForm'
import { DepartementList } from './DepartementList'
import { EmptyDepartementState } from './EmptyDepartementState'
import { useToast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDepartmentsAPI } from '@/hooks/useDepartmentsAPI'

export interface Departement {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export function DepartementsManager() {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; departmentId: string | null }>({
    isOpen: false,
    departmentId: null
  })
  const { showToast, ToastContainer } = useToast()
  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartmentsAPI()

  const handleAdd = async () => {
    if (!formData.name.trim()) return

    try {
      await createDepartment(formData.name.trim(), formData.description.trim())
      setFormData({ name: '', description: '' })
      setIsAdding(false)
      showToast(`Département "${formData.name}" créé avec succès`, 'success')
    } catch {
      showToast('Erreur lors de la création du département', 'error')
    }
  }

  const handleEdit = (id: string) => {
    const dept = departments.find(d => d.id === id)
    if (dept) {
      setFormData({ name: dept.name, description: dept.description || '' })
      setEditingId(id)
    }
  }

  const handleUpdate = async () => {
    if (!formData.name.trim() || !editingId) return

    try {
      await updateDepartment(editingId, {
        name: formData.name.trim(),
        description: formData.description.trim()
      })
      setFormData({ name: '', description: '' })
      setEditingId(null)
      showToast(`Département modifié avec succès`, 'success')
    } catch {
      showToast('Erreur lors de la modification du département', 'error')
    }
  }

  const handleDelete = (id: string) => {
    setDeleteDialog({ isOpen: true, departmentId: id })
  }

  const confirmDelete = async () => {
    if (deleteDialog.departmentId) {
      const dept = departments.find(d => d.id === deleteDialog.departmentId)
      if (dept) {
        try {
          await deleteDepartment(deleteDialog.departmentId)
          showToast(`Département "${dept.name}" supprimé`, 'warning')
          setDeleteDialog({ isOpen: false, departmentId: null })
        } catch {
          showToast('Erreur lors de la suppression du département', 'error')
        }
      }
    }
  }

  const toggleActive = async (id: string) => {
    const dept = departments.find(d => d.id === id)
    if (dept) {
      try {
        await updateDepartment(id, { isActive: !dept.isActive })
        showToast(
          dept.isActive
            ? `Département "${dept.name}" désactivé`
            : `Département "${dept.name}" activé`,
          dept.isActive ? 'warning' : 'success'
        )
      } catch {
        showToast('Erreur lors de la modification du statut', 'error')
      }
    }
  }

  const cancelEdit = () => {
    setFormData({ name: '', description: '' })
    setEditingId(null)
    setIsAdding(false)
  }

  return (
    <>
      <ToastContainer />
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, departmentId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le département"
        message={
          deleteDialog.departmentId
            ? `Êtes-vous sûr de vouloir supprimer le département "${
                departments.find(d => d.id === deleteDialog.departmentId)?.name
              }" ? Cette action est irréversible.`
            : ''
        }
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
      <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <CardTitle>Gestion des Départements</CardTitle>
          </div>
          <DepartementForm
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            formData={formData}
            setFormData={setFormData}
            onAdd={handleAdd}
            onCancel={cancelEdit}
            disabled={editingId !== null}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">Erreur: {error}</div>
        ) : departments.length === 0 ? (
          <EmptyDepartementState />
        ) : (
          <DepartementList
            departements={departments}
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            onEdit={handleEdit}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleActive={toggleActive}
            onCancel={cancelEdit}
            isAdding={isAdding}
          />
        )}
      </CardContent>
      </Card>
    </>
  )
}