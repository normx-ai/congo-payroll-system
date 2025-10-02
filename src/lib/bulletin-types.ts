import { PayrollCalculation } from './payroll'

export interface BulletinData {
  calculation: PayrollCalculation
  month: string
  year: string
  employeeId: string
  company: {
    name: string
    address: string
    city: string
    niu?: string
    logoUrl?: string
  }
  modeReglement?: string
  datePaiement?: string
}

export interface BulletinResult {
  html: string
  pdf: Buffer
}

export interface CompanyInfo {
  name: string
  address: string
  city: string
  niu?: string
}

export interface EmployeeBasicInfo {
  lastName: string
  firstName: string
  employeeCode: string
  position: string
  dateEmbauche?: string
  numeroCNSS?: string
  anciennete?: string
  nombreEnfants?: number
}