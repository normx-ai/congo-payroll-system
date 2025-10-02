'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { api } from '@/lib/api'
import type { Employee, EmployeeFormData } from '@/types/employee'
import { transformEmployeeToFormData, prepareSubmitData } from '../utils/employee-transformers'

interface UseEmployeeFormProps {
  employeeId?: string
  employee?: Employee | null
  onSuccess?: () => void
}

export function useEmployeeForm({ employeeId, employee, onSuccess }: UseEmployeeFormProps) {
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    position: '',
    hireDate: '',
    baseSalary: 0,
    cnssNumber: '',
    nui: '',
    maritalStatus: '',
    childrenCount: 0,
    contractType: '',
    salaryCategory: '',
    conventionCollective: 'Commerce',
    categorieProfessionnelle: 1,
    echelon: 1,
    departmentId: ''
  })
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(employee || null)

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const employeeData = employeeId ? await api.employees.getById(employeeId) : employee
        if (!employeeData) return
        setCurrentEmployee(employeeData)
        const transformedData = transformEmployeeToFormData(employeeData)
        setFormData(transformedData)
      } catch (error) {
        console.error('Erreur chargement employé:', error)
        showToast('Erreur lors du chargement des données de l&apos;employé', 'error')
        router.push('/employes')
      } finally {
        setLoading(false)
      }
    }

    if (employeeId || employee) {
      fetchEmployee()
    } else {
      setLoading(false)
    }
  }, [employeeId, employee, router, showToast])

  const handleChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const isEditing = !!currentEmployee
      const submitData = prepareSubmitData(formData)
      const url = isEditing ? `/api/employees/${currentEmployee.id}` : '/api/employees'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        const successMessage = isEditing ? 'Employé mis à jour avec succès' : 'Employé créé avec succès'
        showToast(successMessage, 'success')
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/employes')
        }
      } else {
        const error = await response.json()
        const errorMessage = isEditing ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création'
        showToast(error.error || errorMessage, 'error')
      }
    } catch (error) {
      const actionText = !!currentEmployee ? 'mise à jour' : 'création'
      console.error(`Erreur ${actionText} employé:`, error)
      showToast(`Erreur lors de la ${actionText}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return {
    loading,
    saving,
    formData,
    currentEmployee,
    isEditing: !!currentEmployee,
    handleChange,
    handleSubmit
  }
}