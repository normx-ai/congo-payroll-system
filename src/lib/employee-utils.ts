import { prisma } from './prisma'

// Interfaces pour les filtres
interface EmployeeFilter {
  tenantId: string
  isActive: boolean
  id?: string | { not: string }
  cnssNumber?: string
  nui?: string
  email?: string
  phone?: { contains: string }
}

interface EmailFilter extends EmployeeFilter {
  email: string
}

// Interface pour la génération de recherche
interface EmployeeSearchData {
  firstName?: string
  lastName?: string
  employeeCode?: string
  email?: string
  position?: string
  [key: string]: string | number | boolean | undefined
}

export async function generateEmployeeCode(tenantId: string): Promise<string> {
  const lastEmployee = await prisma.employee.findFirst({
    where: { tenantId },
    orderBy: { employeeCode: 'desc' }
  })

  if (!lastEmployee) return '0001'

  try {
    const lastNumber = parseInt(lastEmployee.employeeCode)
    const nextNumber = lastNumber + 1
    return nextNumber.toString().padStart(4, '0')
  } catch {
    const count = await prisma.employee.count({ where: { tenantId } })
    return (count + 1).toString().padStart(4, '0')
  }
}

export async function validateEmployeeUniqueness(
  tenantId: string,
  cnssNumber?: string,
  nui?: string,
  email?: string,
  phone?: string,
  excludeId?: string
): Promise<{ isValid: boolean; errors: string[] }> {

  const errors: string[] = []
  const where: EmployeeFilter = { tenantId, isActive: true }
  if (excludeId) where.id = { not: excludeId }

  if (cnssNumber && cnssNumber.trim() !== '') {
    const existing = await prisma.employee.findFirst({
      where: { ...where, cnssNumber: cnssNumber.trim() }
    })
    if (existing) errors.push('Ce numéro CNSS existe déjà')
  }

  if (nui && nui.trim() !== '') {
    const existing = await prisma.employee.findFirst({
      where: { ...where, nui: nui.trim() }
    })
    if (existing) errors.push('Ce NUI existe déjà')
  }

  if (email && email.trim() !== '') {
    const existing = await prisma.employee.findFirst({
      where: { ...where, email: email.trim().toLowerCase() }
    })
    if (existing) errors.push('Cet email existe déjà')
  }

  if (phone && phone.trim() !== '') {
    const cleanPhone = phone.replace(/[\s\-\.]/g, '')
    const existing = await prisma.employee.findFirst({
      where: { ...where, phone: { contains: cleanPhone } }
    })
    if (existing) errors.push('Ce téléphone existe déjà')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export async function checkEmailUniqueness(tenantId: string, email: string, excludeId?: string): Promise<boolean> {
  if (!email || email.trim() === '') return true

  const where: EmailFilter = { tenantId, isActive: true, email: email.trim().toLowerCase() }
  if (excludeId) where.id = { not: excludeId }

  const existing = await prisma.employee.findFirst({ where })
  return !existing
}

export async function checkPhoneUniqueness(tenantId: string, phone: string, excludeId?: string): Promise<boolean> {
  if (!phone || phone.trim() === '') return true

  const cleanPhone = phone.replace(/[\s\-\.]/g, '')
  const where: EmployeeFilter = { tenantId, isActive: true }
  if (excludeId) where.id = { not: excludeId }

  const existing = await prisma.employee.findFirst({
    where: { ...where, phone: { contains: cleanPhone } }
  })
  return !existing
}

export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatEmployeeName(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()} ${lastName.toUpperCase()}`
}

export function generateEmployeeSearch(employee: EmployeeSearchData): string {
  const searchTerms = [
    employee.firstName,
    employee.lastName,
    employee.employeeCode,
    employee.email,
    employee.phone,
    employee.cnssNumber,
    employee.nui,
    employee.position
  ].filter(Boolean)

  return searchTerms.join(' ').toLowerCase()
}