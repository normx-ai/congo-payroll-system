import type { Employee, EmployeeFormData } from '@/types/employee'

export function transformEmployeeToFormData(employeeData: Employee): EmployeeFormData {
  // Mapping des valeurs françaises vers anglaises pour maritalStatus
  const mapMaritalStatus = (value: string): string => {
    const mapping: Record<string, string> = {
      'célibataire': 'single',
      'marié(e)': 'married',
      'divorcé(e)': 'divorced',
      'veuf/veuve': 'widowed'
    }
    return mapping[value] || value
  }

  return {
    firstName: employeeData.firstName || '',
    lastName: employeeData.lastName || '',
    email: employeeData.email || '',
    phone: employeeData.phone || '',
    gender: employeeData.gender || '',
    position: employeeData.position || '',
    hireDate: employeeData.hireDate ? new Date(employeeData.hireDate).toISOString().split('T')[0] : '',
    baseSalary: employeeData.baseSalary || 0,
    cnssNumber: employeeData.cnssNumber || '',
    nui: employeeData.nui || '',
    maritalStatus: mapMaritalStatus(employeeData.maritalStatus || ''),
    childrenCount: employeeData.childrenCount || 0,
    contractType: employeeData.contractType?.toLowerCase() || '',
    salaryCategory: employeeData.salaryCategory || '',
    conventionCollective: employeeData.conventionCollective || 'Commerce',
    categorieProfessionnelle: employeeData.categorieProfessionnelle || 1,
    echelon: employeeData.echelon || 1,
    departmentId: employeeData.department?.id || ''
  }
}

export function prepareSubmitData(formData: EmployeeFormData): Record<string, string | number | Date> {
  const submitData: Record<string, string | number | Date> = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    position: formData.position,
    hireDate: formData.hireDate,
    baseSalary: Number(formData.baseSalary),
    childrenCount: formData.childrenCount,
    cnssNumber: formData.cnssNumber,
    nui: formData.nui,
    conventionCollective: formData.conventionCollective,
    categorieProfessionnelle: formData.categorieProfessionnelle,
    echelon: formData.echelon,
    departmentId: formData.departmentId
  }

  // Ajouter les champs optionnels seulement s'ils sont valides
  if (formData.email) submitData.email = formData.email
  if (formData.phone) submitData.phone = formData.phone
  if (formData.gender && ['male', 'female'].includes(formData.gender)) {
    submitData.gender = formData.gender
  }
  if (formData.contractType && ['cdi', 'cdd', 'stage'].includes(formData.contractType.toLowerCase())) {
    submitData.contractType = formData.contractType.toUpperCase()
  }
  if (formData.salaryCategory) submitData.salaryCategory = formData.salaryCategory
  if (formData.maritalStatus && formData.maritalStatus.trim() !== '' && ['single', 'married', 'divorced', 'widowed'].includes(formData.maritalStatus)) {
    submitData.maritalStatus = formData.maritalStatus
  }

  return submitData
}