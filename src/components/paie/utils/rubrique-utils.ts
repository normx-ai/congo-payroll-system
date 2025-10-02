export const getRubriqueTypeColor = (type: string) => {
  switch (type) {
    case 'GAIN_BRUT':
      return 'text-green-600 bg-green-50'
    case 'GAIN_NON_SOUMIS':
      return 'text-blue-600 bg-blue-50'
    case 'RETENUE_NON_SOUMISE':
      return 'text-orange-600 bg-orange-50'
    case 'COTISATION':
      return 'text-red-600 bg-red-50'
    case 'ELEMENT_NON_IMPOSABLE':
      return 'text-purple-600 bg-purple-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export const getRubriqueTypeLabel = (type: string) => {
  switch (type) {
    case 'GAIN_BRUT':
      return 'Imposable'
    case 'GAIN_NON_SOUMIS':
      return 'Non imposable'
    case 'RETENUE_NON_SOUMISE':
      return 'Retenue'
    case 'COTISATION':
      return 'Cotisation'
    case 'ELEMENT_NON_IMPOSABLE':
      return 'Élément non imposable'
    default:
      return type
  }
}

export interface RubriqueAmount {
  employeeId: string
  rubriqueCode: string
  amount: number
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  position: string
  salaireBase?: number
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