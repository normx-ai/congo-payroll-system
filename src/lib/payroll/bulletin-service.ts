/**
 * Service dédié à la génération et gestion des bulletins de paie
 * Refactorisé depuis api/payroll/generate/route.ts pour une meilleure maintenabilité
 */

import { prisma } from '@/lib/prisma'
import { calculatePayroll } from '@/lib/payroll'
import { BulletinGenerator } from '@/lib/bulletin-generator'
import { BulletinPDFGenerator } from '@/lib/bulletin-pdf'
import { PayrollCalculation, EmployeeData, CompanyData } from '@/types/payroll'

export interface BulletinGenerationRequest {
  employeeId: string
  periode: string
  rubriquesSaisies?: Array<{
    code: string
    amount: number
  }>
  chargesDeductibles?: number
  tenantId: string
}

export interface BulletinGenerationResult {
  success: boolean
  bulletinId?: string
  pdfBuffer?: Buffer
  error?: string
}

export class BulletinService {
  /**
   * Valide les paramètres de génération de bulletin
   */
  static validateRequest(request: BulletinGenerationRequest): string | null {
    if (!request.employeeId || !request.periode) {
      return 'employeeId et periode sont requis'
    }

    if (!/^\d{4}-\d{2}$/.test(request.periode)) {
      return 'Format période invalide (attendu: YYYY-MM)'
    }

    return null
  }

  /**
   * Récupère les données employé avec vérifications
   */
  static async getEmployeeData(employeeId: string, tenantId: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: tenantId,
        isActive: true
      }
    })

    if (!employee) {
      throw new Error('Employé non trouvé ou inactif')
    }

    if (!employee.baseSalary || Number(employee.baseSalary) <= 0) {
      throw new Error('Salaire de base manquant ou invalide')
    }

    return employee
  }

  /**
   * Récupère les données entreprise
   */
  static async getCompanyData(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) {
      throw new Error('Entreprise non trouvée')
    }

    return tenant
  }

  /**
   * Vérifie si un bulletin existe déjà pour la période
   */
  static async checkExistingBulletin(employeeId: string, periode: string) {
    return await prisma.bulletinPaie.findFirst({
      where: {
        employeeId,
        periode
      }
    })
  }

  /**
   * Génère le PDF du bulletin
   */
  static async generateBulletinPDF(
    employee: EmployeeData,
    tenant: CompanyData,
    calculatedData: PayrollCalculation,
    periode: string
  ): Promise<Buffer> {
    const [year, month] = periode.split('-')

    const bulletinData = {
      calculation: calculatedData,
      month,
      year,
      company: {
        name: tenant.companyName || 'Entreprise',
        address: tenant.companyAddress || '',
        city: tenant.companyAddress?.split(',')[1]?.trim() || '',
        niu: tenant.nui || ''
      }
    }

    const html = await BulletinGenerator.generateBulletinHTML(bulletinData)
    return await BulletinPDFGenerator.generateBulletinPDF(html)
  }

  /**
   * Sauvegarde le bulletin en base de données
   */
  static async saveBulletin(
    employee: EmployeeData,
    tenantId: string,
    periode: string,
    grossSalary: number,
    netSalary: number,
    totalDeductions: number,
    totalChargesPatronales: number,
    calculatedData: PayrollCalculation,
    pdfPath?: string
  ) {
    const [year, month] = periode.split('-').map(Number)

    return await prisma.bulletinPaie.create({
      data: {
        employeeId: employee.id,
        tenantId: tenantId,
        month,
        year,
        periode,
        pdfPath,
        status: 'validated',
        grossSalary,
        netSalary,
        totalDeductions,
        totalChargesPatronales,
        dataJson: JSON.parse(JSON.stringify(calculatedData))
      }
    })
  }

  /**
   * Génère un bulletin de paie complet
   */
  static async generateBulletin(request: BulletinGenerationRequest): Promise<BulletinGenerationResult> {
    try {
      // 1. Validation
      const validationError = this.validateRequest(request)
      if (validationError) {
        return { success: false, error: validationError }
      }

      // 2. Récupération des données
      const [employee, tenant] = await Promise.all([
        this.getEmployeeData(request.employeeId, request.tenantId),
        this.getCompanyData(request.tenantId)
      ])

      // 3. Vérification bulletin existant
      const existingBulletin = await this.checkExistingBulletin(request.employeeId, request.periode)
      if (existingBulletin) {
        return { success: false, error: 'Un bulletin existe déjà pour cette période' }
      }

      // 4. Calcul de la paie avec les rubriques saisies
      const mappedRubriques = (request.rubriquesSaisies || []).map(r => ({
        code: r.code || (r as any).rubriqueCode,
        montant: r.amount
      }))
      console.log('🔧 DEBUG BulletinService - Rubriques reçues:', request.rubriquesSaisies)
      console.log('🔧 DEBUG BulletinService - Rubriques mappées:', mappedRubriques)

      const calculatedData = calculatePayroll({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        baseSalary: Number(employee.baseSalary),
        position: employee.position,
        hireDate: employee.hireDate,
        email: employee.email || undefined,
        phone: employee.phone || undefined,
        conventionCollective: employee.conventionCollective || undefined,
        nui: employee.nui || undefined,
        cnssNumber: employee.cnssNumber || undefined,
        categorieProfessionnelle: employee.categorieProfessionnelle || 0,
        echelon: employee.echelon || 0,
        rubriquesSaisies: mappedRubriques
      }, request.periode)

      // 5. Génération PDF
      const pdfBuffer = await this.generateBulletinPDF({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        baseSalary: Number(employee.baseSalary),
        position: employee.position,
        hireDate: employee.hireDate,
        nui: employee.nui || '',
        cnssNumber: employee.cnssNumber || '',
        conventionCollective: employee.conventionCollective || '',
        categorieProfessionnelle: employee.categorieProfessionnelle || 0,
        echelon: employee.echelon || 0
      }, {
        companyName: tenant.companyName,
        companyAddress: tenant.companyAddress || '',
        companyPhone: tenant.companyPhone || '',
        companyEmail: tenant.companyEmail || '',
        nui: tenant.nui || '',
        rccm: tenant.rccm || ''
      }, {
        totalBrut: calculatedData.netAPayer + calculatedData.chargesEmployeur.total,
        netAPayer: calculatedData.netAPayer,
        totalCotisations: calculatedData.retenues.totalRetenues,
        totalChargesPatronales: calculatedData.chargesEmployeur.total,
        rubriques: [],
        cotisations: [],
        retenues: []
      }, request.periode)

      // 6. Sauvegarde en base
      const savedBulletin = await this.saveBulletin({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        baseSalary: Number(employee.baseSalary),
        position: employee.position,
        hireDate: employee.hireDate,
        nui: employee.nui || '',
        cnssNumber: employee.cnssNumber || '',
        conventionCollective: employee.conventionCollective || '',
        categorieProfessionnelle: employee.categorieProfessionnelle || 0,
        echelon: employee.echelon || 0
      },
        request.tenantId,
        request.periode,
        calculatedData.gains.totalGains || 0,
        calculatedData.netAPayer || 0,
        calculatedData.retenues.totalRetenues || 0,
        calculatedData.chargesEmployeur.total || 0,
        {
          totalBrut: calculatedData.gains.totalGains,
          netAPayer: calculatedData.netAPayer,
          totalCotisations: calculatedData.retenues.totalRetenues,
          totalChargesPatronales: calculatedData.chargesEmployeur.total,
          rubriques: [],
          cotisations: [],
          retenues: []
        }
      )

      return {
        success: true,
        bulletinId: savedBulletin.id,
        pdfBuffer
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }
}