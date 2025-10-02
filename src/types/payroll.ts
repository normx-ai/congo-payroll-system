// Types TypeScript pour la gestion de la paie

export interface PayrollCalculation {
  totalBrut: number
  netAPayer: number
  totalCotisations: number
  totalChargesPatronales: number
  rubriques: PayrollRubrique[]
  cotisations: PayrollCotisation[]
  retenues: PayrollRetenue[]
}

export interface PayrollRubrique {
  code: string
  libelle: string
  montant: number
  type: 'GAIN_BRUT' | 'GAIN_NON_SOUMIS'
}

export interface PayrollCotisation {
  code: string
  libelle: string
  montantSalarial: number
  montantPatronal: number
  taux: number
}

export interface PayrollRetenue {
  code: string
  libelle: string
  montant: number
  type: 'IRPP' | 'CAMU' | 'AUTRE'
}

export interface EmployeeData {
  id: string
  firstName: string
  lastName: string
  employeeCode: string
  baseSalary: number
  position: string
  hireDate: Date
  nui: string
  cnssNumber: string
  conventionCollective: string
  categorieProfessionnelle: number
  echelon: number
}

export interface CompanyData {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  nui: string
  rccm: string
}

export interface BulletinData {
  employee: EmployeeData
  company: CompanyData
  periode: string
  calculations: PayrollCalculation
}