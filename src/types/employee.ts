export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  gender: string
  position: string
  hireDate: string
  baseSalary: number
  cnssNumber: string
  nui: string
  maritalStatus: string
  childrenCount: number
  contractType: string
  salaryCategory: string
  conventionCollective: string
  categorieProfessionnelle: number
  echelon: number
  departmentId: string
}

export interface EmployeeCreateRequest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  gender: 'male' | 'female'
  position: string
  hireDate: string
  baseSalary: number
  cnssNumber: string
  nui: string
  contractType: 'CDI' | 'CDD' | 'Stage'
  salaryCategory?: string
  conventionCollective: string
  categorieProfessionnelle: number
  echelon: number
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  childrenCount: number
  departmentId: string
}

export interface Employee {
  id: string
  tenantId: string
  employeeCode: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  gender: string
  position: string
  hireDate: Date
  baseSalary: number
  cnssNumber?: string
  nui?: string
  maritalStatus: string
  childrenCount: number
  contractType: string
  salaryCategory?: string
  conventionCollective: string
  categorieProfessionnelle: number
  echelon: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  department?: { id: string; name: string } | null
  chargesFixes?: EmployeeChargeFixe[]
}

export interface EmployeeChargeFixe {
  id: string
  employeeId: string
  rubriqueCode: string
  amount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}