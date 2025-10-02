import { prisma } from './prisma'
import { EmployeeCreateInput, EmployeeUpdateInput } from './validations'
import { generateEmployeeCode, validateEmployeeUniqueness } from './employee-utils'

// Interfaces pour les filtres de recherche
interface EmployeeSearchFilters {
  tenantId: string
  isActive?: boolean
  OR?: Array<{
    firstName?: { contains: string; mode: 'insensitive' }
    lastName?: { contains: string; mode: 'insensitive' }
    employeeCode?: { contains: string; mode: 'insensitive' }
  }>
  departmentId?: string
  contractType?: string
}

// Interface pour les données de mise à jour sécurisées
interface EmployeeUpdateData {
  [key: string]: string | number | boolean | Date | null
}

export class EmployeeService {
  static async getEmployees(tenantId: string, params: {
    page: number
    size: number
    search?: string
    departmentId?: string
    contractType?: string
    isActive?: boolean
  }) {
    const { page, size, search, departmentId, contractType, isActive } = params
    const skip = (page - 1) * size

    const where: EmployeeSearchFilters = { tenantId }
    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (departmentId) where.departmentId = departmentId
    if (contractType) where.contractType = contractType

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          employeeAllowances: true,
          chargesFixes: true
        },
        orderBy: { employeeCode: 'asc' },
        skip,
        take: size
      }),
      prisma.employee.count({ where })
    ])

    return {
      employees,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size)
    }
  }

  static async createEmployee(tenantId: string, data: EmployeeCreateInput) {
    await validateEmployeeUniqueness(tenantId, data.cnssNumber, data.nui, data.email, data.phone)
    const employeeCode = await generateEmployeeCode(tenantId)

    return prisma.employee.create({
      data: {
        tenantId,
        employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        position: data.position,
        hireDate: new Date(data.hireDate),
        baseSalary: data.baseSalary,
        cnssNumber: data.cnssNumber,
        nui: data.nui,
        departmentId: data.departmentId || null,
        contractType: data.contractType,
        salaryCategory: data.salaryCategory || null,
        conventionCollective: data.conventionCollective,
        categorieProfessionnelle: data.categorieProfessionnelle,
        echelon: data.echelon,
        maritalStatus: data.maritalStatus,
        childrenCount: data.childrenCount,
        isActive: true
      },
      include: { department: { select: { id: true, name: true } } }
    })
  }

  static async getEmployeeById(tenantId: string, id: string) {
    return prisma.employee.findFirst({
      where: { id, tenantId },
      include: { department: { select: { id: true, name: true } } }
    })
  }

  static async updateEmployee(tenantId: string, id: string, data: EmployeeUpdateInput) {
    const updateData: EmployeeUpdateData = {}
    Object.keys(data).forEach((key) => {
      const value = (data as EmployeeUpdateData)[key]
      if (value !== undefined) {
        if (key === 'hireDate') {
          updateData[key] = new Date(value as string)
        } else if (key === 'departmentId') {
          // Convertir chaîne vide en null pour departmentId
          updateData[key] = value === '' ? null : value
        } else {
          updateData[key] = value
        }
      }
    })

    return prisma.employee.update({
      where: { id },
      data: updateData,
      include: { department: { select: { id: true, name: true } } }
    })
  }

  static async updateEmployeeStatus(tenantId: string, id: string, isActive: boolean) {
    const employee = await this.getEmployeeById(tenantId, id)
    if (!employee) throw new Error('Employé non trouvé')

    return await prisma.employee.update({
      where: { id },
      data: { isActive }
    })
  }

  static async deleteEmployee(tenantId: string, id: string) {
    const employee = await this.getEmployeeById(tenantId, id)
    if (!employee) throw new Error('Employé non trouvé')

    // Vérifier s'il a des bulletins de paie
    const payslipsCount = await prisma.payslip.count({
      where: { employeeId: id }
    })

    if (payslipsCount > 0) {
      // Si l'employé a des bulletins, on le désactive seulement
      await prisma.employee.update({
        where: { id },
        data: { isActive: false }
      })
      throw new Error('DEACTIVATE_ONLY')
    }

    // Si pas de données, suppression réelle
    await prisma.employee.delete({
      where: { id }
    })
  }
}