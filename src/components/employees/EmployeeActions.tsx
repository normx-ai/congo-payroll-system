'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface EmployeeActionsProps {
  onEmployeeChanged?: () => void
  onRefresh?: () => void
}

interface ConfirmationState {
  isOpen: boolean
  type: 'delete' | 'toggle' | null
  employeeId: string | null
  isActive?: boolean
}

export function useEmployeeActions({ onEmployeeChanged, onRefresh }: EmployeeActionsProps) {
  const { showToast } = useToast()
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    type: null,
    employeeId: null
  })

  const openDeleteConfirmation = useCallback((employeeId: string) => {
    setConfirmation({
      isOpen: true,
      type: 'delete',
      employeeId
    })
  }, [])

  const openToggleConfirmation = useCallback((employeeId: string, isActive: boolean) => {
    setConfirmation({
      isOpen: true,
      type: 'toggle',
      employeeId,
      isActive
    })
  }, [])

  const closeConfirmation = useCallback(() => {
    setConfirmation({
      isOpen: false,
      type: null,
      employeeId: null
    })
  }, [])

  const executeDelete = useCallback(async () => {
    if (!confirmation.employeeId) return

    const employeeId = confirmation.employeeId
    closeConfirmation()

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.deactivated) {
          showToast('Employé désactivé (il a des bulletins de paie associés)', 'warning')
        } else {
          showToast('Employé supprimé avec succès', 'success')
        }
        onEmployeeChanged?.()
        onRefresh?.()
      } else {
        const error = await response.json()
        showToast(error.error || 'Erreur lors de la suppression', 'error')
      }
    } catch (error) {
      console.error('Erreur suppression:', error)
      showToast('Erreur lors de la suppression', 'error')
    }
  }, [confirmation.employeeId, showToast, onEmployeeChanged, onRefresh, closeConfirmation])

  const executeToggleStatus = useCallback(async () => {
    // Capturer l'état actuel avant toute opération async
    setConfirmation(current => {
      if (!current.employeeId || current.isActive === undefined) {
        return current
      }

      const employeeId = current.employeeId
      const isActive = current.isActive
      const action = isActive ? 'désactiver' : 'activer'

      // Lancer la requête de façon asynchrone
      const doUpdate = async () => {
        try {
          const response = await fetch(`/api/employees/${employeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !isActive })
          })

          if (response.ok) {
            const actionText = isActive ? 'désactivé' : 'activé'
            showToast(`Employé ${actionText} avec succès`, 'success')
            onEmployeeChanged?.()
            onRefresh?.()
          } else {
            const error = await response.json()
            showToast(error.error || `Erreur lors de l'${action}ion`, 'error')
          }
        } catch (error) {
          console.error(`Erreur ${action}ion:`, error)
          showToast(`Erreur lors de l'${action}ion`, 'error')
        }

        // Fermer le modal après la requête
        setConfirmation({
          isOpen: false,
          type: null,
          employeeId: null
        })
      }

      doUpdate()

      return current // Garder l'état pendant la requête
    })
  }, [showToast, onEmployeeChanged, onRefresh])

  const ConfirmationDialogComponent = () => {
    if (confirmation.type === 'delete') {
      return (
        <ConfirmationDialog
          open={confirmation.isOpen}
          onOpenChange={closeConfirmation}
          title="Supprimer l'employé"
          description="Êtes-vous sûr de vouloir supprimer cet employé ? Si l'employé a des bulletins de paie associés, il sera seulement désactivé."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="destructive"
          onConfirm={executeDelete}
        />
      )
    }

    if (confirmation.type === 'toggle') {
      const action = confirmation.isActive ? 'désactiver' : 'activer'
      return (
        <ConfirmationDialog
          open={confirmation.isOpen}
          onOpenChange={(open) => {
            if (!open) closeConfirmation()
          }}
          title={`${action.charAt(0).toUpperCase() + action.slice(1)} l'employé`}
          description={`Êtes-vous sûr de vouloir ${action} cet employé ?`}
          confirmText={action.charAt(0).toUpperCase() + action.slice(1)}
          cancelText="Annuler"
          onConfirm={executeToggleStatus}
        />
      )
    }

    return null
  }

  return {
    handleDelete: openDeleteConfirmation,
    handleToggleStatus: openToggleConfirmation,
    ConfirmationDialogComponent
  }
}