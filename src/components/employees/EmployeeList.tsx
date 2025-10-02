'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { EmployeeEditForm } from './EmployeeEditForm'
import { EmployeeFilters } from './EmployeeFilters'
import { EmployeeTable } from './EmployeeTable'
import { EmployeeChargesFixesModal } from './EmployeeChargesFixesModal'
import { useEmployeeActions } from './EmployeeActions'
import { filterEmployees } from './employee-utils'
import type { Employee } from '@/types/employee'

interface EmployeeListProps {
  onEmployeeChanged?: () => void
}

export function EmployeeList({ onEmployeeChanged }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showChargesFixesModal, setShowChargesFixesModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const { showToast, ToastContainer } = useToast()

  // Charger les employés
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employees?isActive=all')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des employés')
      }
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Erreur:', error)
      showToast('Erreur lors du chargement des employés', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const handleRefresh = useCallback(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const { handleDelete, handleToggleStatus, ConfirmationDialogComponent } = useEmployeeActions({
    onEmployeeChanged,
    onRefresh: handleRefresh
  })

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const handleConfigureCharges = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowChargesFixesModal(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEmployee(null)
    fetchEmployees()
    onEmployeeChanged?.()
  }

  const filteredEmployees = useMemo(() => {
    return filterEmployees(employees, searchTerm, filterStatus)
  }, [employees, searchTerm, filterStatus])


  if (showForm) {
    return (
      <EmployeeEditForm
        employee={editingEmployee}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingEmployee(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Employés</CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un employé
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <EmployeeFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />

          <EmployeeTable
            employees={filteredEmployees}
            loading={loading}
            searchTerm={searchTerm}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onConfigureCharges={handleConfigureCharges}
          />
        </CardContent>
      </Card>

      {selectedEmployee && (
        <EmployeeChargesFixesModal
          isOpen={showChargesFixesModal}
          onClose={() => {
            setShowChargesFixesModal(false)
            setSelectedEmployee(null)
          }}
          employeeId={selectedEmployee.id}
          employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
        />
      )}

      <ConfirmationDialogComponent />
      <ToastContainer />
    </div>
  )
}