export interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  baseSalary?: number
  hireDate?: Date | string
  department?: { id: string; name: string } | null
  conventionCollective?: string
  contractType?: string
  categorieProfessionnelle?: number
  maritalStatus?: string
  childrenCount?: number
  echelon?: number
  salaryCategory?: string
  nui?: string
  cnssNumber?: string
  seniority?: string
  chargesFixes?: Array<{
    id: string
    rubriqueCode: string
    amount: number
    isActive: boolean
  }>
}

export interface PayrollParameter {
  employeeId: string
  parameter: string
  value: number
}

export interface RubriqueAmount {
  employeeId: string
  rubriqueCode: string
  amount: number
}

export interface ReviewStepProps {
  selectedEmployeeData: Employee | undefined
  parameters: PayrollParameter[]
  amounts: RubriqueAmount[]
  month: string
  year: string
  onValidate: () => void
  onRevise: () => void
}

export interface CompanyInfo {
  name: string
  address: string
  city: string
  niu?: string
}