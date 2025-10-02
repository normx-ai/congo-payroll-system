import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmployeeFormData, EmployeeCreateRequest } from '@/types/employee'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  position: '',
  hireDate: '',
  baseSalary: 90000,
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
}

// Fonction pour mapper les statuts matrimoniaux français vers anglais
function mapMaritalStatus(frenchStatus: string): 'single' | 'married' | 'divorced' | 'widowed' {
  const mapping: Record<string, 'single' | 'married' | 'divorced' | 'widowed'> = {
    'célibataire': 'single',
    'marié(e)': 'married',
    'divorcé(e)': 'divorced',
    'veuf/veuve': 'widowed'
  }
  return mapping[frenchStatus] || 'single'
}

export function useEmployeeForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData)
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = Boolean(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.gender &&
    formData.position.trim() &&
    formData.hireDate &&
    formData.baseSalary >= 90000 &&
    formData.cnssNumber && (formData.cnssNumber.match(/^\d{8}\s\d{2}$/) || formData.cnssNumber.length >= 10) &&  // CNSS Congo format
    formData.nui && (formData.nui.match(/^P\d{15}$/) || formData.nui.length >= 15) &&  // NUI Congo format
    formData.maritalStatus &&
    formData.contractType &&
    formData.conventionCollective &&
    formData.categorieProfessionnelle > 0 &&
    formData.echelon > 0
  )

  // Debug validation - Only in development
  if (process.env.NODE_ENV === 'development') {
    // Only log validation issues, not sensitive data
    const validationIssues = []
    if (!formData.firstName.trim()) validationIssues.push('firstName missing')
    if (!formData.lastName.trim()) validationIssues.push('lastName missing')
    if (!formData.gender) validationIssues.push('gender missing')
    if (!formData.position.trim()) validationIssues.push('position missing')
    if (!formData.hireDate) validationIssues.push('hireDate missing')
    if (formData.baseSalary < 90000) validationIssues.push('baseSalary too low')
    if (!formData.cnssNumber || formData.cnssNumber.length < 10) validationIssues.push('cnssNumber invalid')
    if (!formData.nui || !formData.nui.startsWith('P') || formData.nui.length < 15) validationIssues.push('nui invalid')
    if (!formData.maritalStatus) validationIssues.push('maritalStatus missing')
    if (!formData.contractType) validationIssues.push('contractType missing')

    if (validationIssues.length > 0) {
      console.debug('Employee form validation issues:', validationIssues)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValid || loading) return

    setLoading(true)
    showToast('Création de l\'employé en cours...', 'info')

    try {
      // Mapper les données vers le format attendu par l'API backend (camelCase)
      const employeeData: EmployeeCreateRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || '',
        phone: formData.phone || '',
        gender: formData.gender as 'male' | 'female',
        position: formData.position,
        hireDate: formData.hireDate,
        baseSalary: formData.baseSalary,
        cnssNumber: formData.cnssNumber,
        nui: formData.nui,
        contractType: formData.contractType.toUpperCase() as 'CDI' | 'CDD' | 'Stage',
        salaryCategory: formData.salaryCategory || undefined,
        conventionCollective: formData.conventionCollective,
        categorieProfessionnelle: formData.categorieProfessionnelle,
        echelon: formData.echelon,
        maritalStatus: mapMaritalStatus(formData.maritalStatus),
        childrenCount: formData.childrenCount,
        departmentId: formData.departmentId
      }

      await api.employees.create(employeeData)
      showToast('✅ Employé créé avec succès !', 'success')

      setTimeout(() => {
        router.push('/employes')
      }, 1500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Création échouée'

      // Log client-side error (no sensitive data)
      if (process.env.NODE_ENV === 'development') {
        console.error('Employee creation failed:', {
          error: errorMessage,
          timestamp: new Date().toISOString()
        })
      }

      showToast(`❌ Erreur: ${errorMessage}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
    isValid
  }
}